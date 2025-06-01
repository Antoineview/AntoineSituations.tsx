import { NextApiRequest, NextApiResponse } from 'next'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { neon } from '@neondatabase/serverless';
import { 
  verifyRegistrationResponse,
  VerifiedRegistrationResponse,
  RegistrationResponseJSON
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

// Helper function to convert ArrayBuffer to Buffer (needed for Neon BYTEA)
function arrayBufferToBuffer(ab: ArrayBuffer): Buffer {
  const buf = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
      buf[i] = view[i];
  }
  return buf;
}

// Helper function to convert array of numbers (from JSON) to Buffer
function arrayNumToBuffer(arr: number[]): Buffer {
  return Buffer.from(arr);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Register API: Received request');
    const { credential, invitationId } = req.body

    if (!credential || !invitationId) {
      console.log('Register API: Missing credential or invitationId');
      return res.status(400).json({ message: 'Credential and invitationId are required' })
    }
    console.log('Register API: credential and invitationId received', { invitationId });
    console.log('Register API: received credential object keys:', Object.keys(credential));
    console.log('Register API: received credential.response object keys:', Object.keys(credential.response));

    // Get the session to retrieve the challenge
    const session = await getIronSession<IronSessionData>(req, res, sessionOptions);
    const challengeFromSession = session.challenge; // Retrieve the stored challenge (as Buffer)

    console.log('Register API: Challenge retrieved from session:', challengeFromSession);

    // Clear the challenge from the session after retrieval (important for security)
    session.challenge = undefined;
    await session.save();
    
    if (!challengeFromSession) {
        console.error('Register API: Challenge not found in session.');
        return res.status(400).json({ message: 'Authentication ceremony timed out or challenge is missing.' });
    }
    console.log('Register API: Retrieved challenge from session and cleared.');

    // Convert the challenge Buffer to Base64URL string for verification
    const expectedChallengeString = isoBase64URL.fromBuffer(Buffer.from(challengeFromSession));
    console.log('Register API: Converted challenge to Base64URL string:', expectedChallengeString);

    // 2. Process the passkey credential using @simplewebauthn/server immediately after getting challenge
    console.log('Register API: Processing passkey credential with @simplewebauthn/server...');

    // Convert the raw credential data to the format expected by @simplewebauthn/server
    const credentialForVerification: RegistrationResponseJSON = {
        id: credential.id,
        rawId: isoBase64URL.fromBuffer(new Uint8Array(credential.rawId)),
        response: {
            clientDataJSON: isoBase64URL.fromBuffer(new Uint8Array(credential.response.clientDataJSON)),
            attestationObject: isoBase64URL.fromBuffer(new Uint8Array(credential.response.attestationObject)),
            transports: credential.response.transports,
        },
        type: credential.type,
        clientExtensionResults: credential.clientExtensionResults || {},
    };

    // Configure verifyRegistrationResponse options
    const verificationOptions = {
        response: credentialForVerification,
        expectedChallenge: expectedChallengeString,
        expectedOrigin: process.env.NEXT_PUBLIC_WEB_ORIGIN as string,
        expectedRPID: process.env.NEXT_PUBLIC_WEB_ORIGIN?.replace(/^https?:\/\//, '') as string,
        requireUserVerification: true,
    };

    console.log('Register API: Verification options being passed to verifyRegistrationResponse:', {
        ...verificationOptions,
        response: {
            ...verificationOptions.response,
            response: {
                ...verificationOptions.response.response,
                clientDataJSON: verificationOptions.response.response.clientDataJSON.substring(0, 100) + '...',
                attestationObject: verificationOptions.response.response.attestationObject.substring(0, 100) + '...',
            },
        },
    });

    let verification;
    try {
        verification = await verifyRegistrationResponse(verificationOptions);
        console.log('Register API: Passkey verification successful.', verification);
    } catch (verificationError) {
        console.error('Register API: Passkey verification failed:', verificationError);
        return res.status(400).json({ message: 'Passkey verification failed' });
    }

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
        console.error('Register API: Verification result not as expected.', verification);
        return res.status(400).json({ message: 'Passkey verification failed' });
    }

    const { 
        credentialPublicKey,
        credentialID,
        counter,
        // transports, // Transports are also available here if needed
    } = registrationInfo.credential;

    console.log('Register API: Extracted registration info:', { 
        credentialID: isoBase64URL.fromBuffer(credentialID), // Log as string for readability
        counter,
        // transports, // Log transports if needed
    });

    // Connect to Sanity to check invitation status (Moved after verification)
    console.log('Register API: Connecting to Sanity to check invitation status (after verification)...');
    const sanityClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    })

    console.log('Register API: Fetching invitation from Sanity (after verification)...', { invitationId });
    const invitation = await sanityClient.getDocument(invitationId);
    console.log('Register API: Sanity invitation result (after verification):', invitation);

    // Allow registration even if invitation is used, but only if a user with this invitation_id doesn't exist yet.
    // This handles cases where the user was created but Sanity wasn't updated.
    // The primary invitation check is now done after verification to avoid unnecessary DB/Sanity calls on verification failure.
    if (!invitation) {
        console.log('Register API: Invalid invitation (after verification).');
        // This case should ideally not be reached if the initial check passed, but as a safeguard:
        return res.status(400).json({ message: 'Invalid invitation' });
    }

    // Connect to Neon database (Moved after verification)
    console.log('Register API: Connecting to Neon DB (after verification)...');
    const sql = neon(process.env.DATABASE_URL as string);
    console.log('Register API: Connected to Neon DB (after verification).');

    // Check if a user with this invitation_id already exists
    console.log('Register API: Checking for existing user with invitation_id (after verification)...', { invitationId });
    const existingUsers = await sql`SELECT id FROM users WHERE invitation_id = ${invitationId}`;
    let userId;

    if (existingUsers.length > 0) {
      // User already exists, use their ID
      userId = existingUsers[0].id;
      console.log('Register API: Existing user found with ID (after verification):', userId);
      // If invitation is already marked as used in Sanity, but user exists, registration completed previously.
      // We might want to handle this by just confirming success or re-attaching session.
      if (invitation.used) {
          console.log('Register API: User already exists and invitation already used. Registration previously completed (after verification).');
          // Re-set the session and return success
          // const session = await getIronSession<IronSessionData>(req, res, sessionOptions) // Session already retrieved above
          session.user = {
              id: userId,
              authenticated: true,
          };
          await session.save();
          // Note: Returning 200 here means the frontend will think registration was successful again.
          // Depending on desired UX, you might return a different status or message.
          return res.status(200).json({ success: true, userId: userId, message: 'Registration already completed.' });
      }
       console.log('Register API: User exists, but invitation not marked as used. Proceeding to store credential and mark invitation (after verification).');

    } else {
      // No existing user with this invitation_id, create a new one
      console.log('Register API: No existing user found, creating new user (after verification)...', { invitationId });
      const newUser = await sql`INSERT INTO users (invitation_id) VALUES (${invitationId}) RETURNING id`;
      userId = newUser[0].id; // Assuming the result is an array with one row
      console.log('Register API: New user created with ID (after verification):', userId);
    }

    // 3. Store the passkey credential in the database (Moved after verification)
    console.log('Register API: Storing passkey credential in DB (after verification)...');

    // Convert binary data to Buffer for storage in Neon BYTEA columns
    const credentialIdBuffer = arrayBufferToBuffer(credentialID);
    const publicKeyBuffer = arrayBufferToBuffer(credentialPublicKey);
    const signCounter = counter; // Use the counter from verification
    // Use transports directly from the client credential object as it seems more reliably provided there
    const transportsToStore = credential.response?.transports; 

    console.log('Register API: Prepared credential data for DB insert (after verification):', {
        credentialId: credentialIdBuffer ? 'Buffer' : credentialIdBuffer, 
        userId,
        publicKey: publicKeyBuffer ? 'Buffer' : publicKeyBuffer, 
        signCounter,
        transports: transportsToStore
    });

    // Check if this credential ID already exists for this user to prevent duplicates
    console.log('Register API: Checking for existing credential for this user (after verification)...');
    // Need to query using the Buffer credentialIdBuffer
    const existingCredential = await sql`SELECT id FROM passkey_credentials WHERE id = ${credentialIdBuffer} AND user_id = ${userId}`;

    if (existingCredential.length === 0) {
         // Only insert if the credential doesn't already exist for this user
         await sql`INSERT INTO passkey_credentials (id, user_id, public_key, sign_counter, transports) VALUES (${credentialIdBuffer}, ${userId}, ${publicKeyBuffer}, ${signCounter}, ${transportsToStore})`;
         console.log('Register API: Passkey credential stored in DB (after verification).');
    } else {
        console.log('Register API: Passkey credential already exists for this user (after verification).');
        // If credential exists, maybe update sign counter or just confirm success
        // For now, we'll treat it as success if the user exists and credential is sent again
    }

    // 4. Mark the invitation as used in Sanity (Moved after verification)
    // Only mark as used if it wasn't already
    if (!invitation.used) {
        console.log('Register API: Patching invitation in Sanity (after verification)...', { invitationId });
        await sanityClient
          .patch(invitationId)
          .set({ used: true })
          .commit()
        console.log('Register API: Invitation marked as used in Sanity (after verification).');
    } else {
        console.log('Register API: Invitation already marked as used in Sanity (after verification).');
    }

    // 5. Set the user session (Moved after verification)
    console.log('Register API: Setting user session (after verification)...', { userId });
    // const session = await getIronSession<IronSessionData>(req, res, sessionOptions) // Session already retrieved above
    session.user = {
      id: userId,
      authenticated: true,
    }
    await session.save()
    console.log('Register API: Session saved (after verification).');

    console.log('Register API: Registration successful.');
    res.status(200).json({ success: true, userId: userId })

  } catch (error) {
    console.error('Register API: Error in catch block:', error)
    // Note: In a real app, handle specific errors (e.g., database errors, Sanity errors)
    res.status(500).json({ message: 'Registration failed' })
  }
} 