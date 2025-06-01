import { NextApiRequest, NextApiResponse } from 'next'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { neon } from '@neondatabase/serverless';

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

    // Connect to Sanity to check invitation status
    console.log('Register API: Connecting to Sanity...');
    const sanityClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    })

    console.log('Register API: Fetching invitation from Sanity...', { invitationId });
    const invitation = await sanityClient.getDocument(invitationId);
    console.log('Register API: Sanity invitation result:', invitation);

    // Allow registration even if invitation is used, but only if a user with this invitation_id doesn't exist yet.
    // This handles cases where the user was created but Sanity wasn't updated.
    if (!invitation) {
        console.log('Register API: Invalid invitation');
        return res.status(400).json({ message: 'Invalid invitation' });
    }

    // Connect to Neon database
    console.log('Register API: Connecting to Neon DB...');
    const sql = neon(process.env.DATABASE_URL as string);
    console.log('Register API: Connected to Neon DB.');

    // Check if a user with this invitation_id already exists
    console.log('Register API: Checking for existing user with invitation_id...', { invitationId });
    const existingUsers = await sql`SELECT id FROM users WHERE invitation_id = ${invitationId}`;
    let userId;

    if (existingUsers.length > 0) {
      // User already exists, use their ID
      userId = existingUsers[0].id;
      console.log('Register API: Existing user found with ID:', userId);
      // If invitation is already marked as used in Sanity, but user exists, registration completed previously.
      // We might want to handle this by just confirming success or re-attaching session.
      if (invitation.used) {
          console.log('Register API: User already exists and invitation already used. Registration previously completed.');
          // Re-set the session and return success
          const session = await getIronSession<IronSessionData>(req, res, sessionOptions)
          session.user = {
              id: userId,
              authenticated: true,
          };
          await session.save();
          return res.status(200).json({ success: true, userId: userId, message: 'Registration already completed.' });
      }
       console.log('Register API: User exists, but invitation not marked as used. Proceeding to store credential and mark invitation.');

    } else {
      // No existing user with this invitation_id, create a new one
      console.log('Register API: No existing user found, creating new user...', { invitationId });
      const newUser = await sql`INSERT INTO users (invitation_id) VALUES (${invitationId}) RETURNING id`;
      userId = newUser[0].id; // Assuming the result is an array with one row
      console.log('Register API: New user created with ID:', userId);
    }

    // 2. Store the passkey credential
    console.log('Register API: Storing passkey credential...');
    // Ensure rawId and authenticatorData are available before converting
    const credentialId = credential.rawId ? arrayNumToBuffer(credential.rawId) : undefined;
    // Authenticator data is crucial for public key and signature verification
    const authenticatorData = credential.response?.authenticatorData;
    const publicKey = authenticatorData ? arrayNumToBuffer(authenticatorData) : undefined;
    // Sign counter is also part of authenticator data
    // In a real implementation, you would parse authenticatorData to get the sign counter and public key
    const signCounter = 0; // Placeholder - needs to be extracted from authenticatorData
    const transports = credential.response?.transports; // Transports might be optional

    console.log('Register API: Prepared credential data for DB insert:', {
        credentialId: credentialId ? 'Buffer' : credentialId, // Log type/status instead of full Buffer
        userId,
        publicKey: publicKey ? 'Buffer' : publicKey, // Log type/status instead of full Buffer
        signCounter,
        transports
    });

    // Check if critical data is missing before attempting DB insert
    if (!credentialId || !userId || !publicKey) {
        console.error('Register API: Missing critical data for DB insert.', {
            credentialId: credentialId ? 'Present' : 'Missing',
            userId: userId ? 'Present' : 'Missing',
            publicKey: publicKey ? 'Present' : 'Missing',
            transports: transports ? 'Present' : 'Missing'
        });
        // Throw a specific error or return a 400 response
        return res.status(400).json({ message: 'Missing essential passkey data for registration' });
    }

    // Check if this credential ID already exists for this user to prevent duplicates
    console.log('Register API: Checking for existing credential for this user...');
    const existingCredential = await sql`SELECT id FROM passkey_credentials WHERE id = ${credentialId} AND user_id = ${userId}`;

    if (existingCredential.length === 0) {
         // Only insert if the credential doesn't already exist for this user
         await sql`INSERT INTO passkey_credentials (id, user_id, public_key, sign_counter, transports) VALUES (${credentialId}, ${userId}, ${publicKey}, ${signCounter}, ${transports})`;
         console.log('Register API: Passkey credential stored in DB.');
    } else {
        console.log('Register API: Passkey credential already exists for this user.');
        // If credential exists, maybe update sign counter or just confirm success
        // For now, we'll treat it as success if the user exists and credential is sent again
    }

    // 3. Mark the invitation as used in Sanity
    // Only mark as used if it wasn't already
    if (!invitation.used) {
        console.log('Register API: Patching invitation in Sanity...', { invitationId });
        await sanityClient
          .patch(invitationId)
          .set({ used: true })
          .commit()
        console.log('Register API: Invitation marked as used in Sanity.');
    } else {
        console.log('Register API: Invitation already marked as used in Sanity.');
    }

    // 4. Set the user session
    console.log('Register API: Setting user session...', { userId });
    const session = await getIronSession<IronSessionData>(req, res, sessionOptions)
    session.user = {
      id: userId,
      authenticated: true,
    }
    await session.save()
    console.log('Register API: Session saved.');

    console.log('Register API: Registration successful.');
    res.status(200).json({ success: true, userId: userId })

  } catch (error) {
    console.error('Register API: Error in catch block:', error)
    // Note: In a real app, handle specific errors (e.g., database errors, Sanity errors)
    res.status(500).json({ message: 'Registration failed' })
  }
} 