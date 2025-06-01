import { NextApiRequest, NextApiResponse } from 'next'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'
import { neon } from '@neondatabase/serverless'
import { 
  verifyAuthenticationResponse,
  VerifiedAuthenticationResponse,
  AuthenticationResponseJSON
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'

interface CustomSessionData extends IronSessionData {
  challengeData?: {
    buffer: number[];
  };
  user?: {
    id: string;
    authenticated: boolean;
  };
}

const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Verify API: Received request');
    const { credential } = req.body

    if (!credential) {
      console.log('Verify API: Missing credential');
      return res.status(400).json({ message: 'Credential is required' })
    }

    // Get the session to retrieve the challenge
    const session = await getIronSession<CustomSessionData>(req, res, sessionOptions)
    const challengeData = session.challengeData

    console.log('Verify API: Challenge data retrieved from session:', challengeData);

    // Clear the challenge from the session after retrieval (important for security)
    session.challengeData = undefined
    await session.save()
    
    if (!challengeData?.buffer) {
        console.error('Verify API: Challenge not found in session.');
        return res.status(400).json({ message: 'Authentication ceremony timed out or challenge is missing.' });
    }

    // Convert the challenge array to Buffer, then to Base64URL string for verification
    const challengeBuffer = Buffer.from(challengeData.buffer);
    const expectedChallengeString = isoBase64URL.fromBuffer(challengeBuffer);
    console.log('Verify API: Converted challenge to Base64URL string:', expectedChallengeString);

    // Convert the raw credential data to the format expected by @simplewebauthn/server
    const credentialForVerification: AuthenticationResponseJSON = {
        id: credential.id,
        rawId: isoBase64URL.fromBuffer(new Uint8Array(credential.rawId)),
        response: {
            clientDataJSON: isoBase64URL.fromBuffer(new Uint8Array(credential.response.clientDataJSON)),
            authenticatorData: isoBase64URL.fromBuffer(new Uint8Array(credential.response.authenticatorData)),
            signature: isoBase64URL.fromBuffer(new Uint8Array(credential.response.signature)),
            userHandle: credential.response.userHandle ? isoBase64URL.fromBuffer(new Uint8Array(credential.response.userHandle)) : undefined,
        },
        type: credential.type,
        clientExtensionResults: credential.clientExtensionResults || {},
    };

    // Connect to Neon database to get the credential
    console.log('Verify API: Connecting to Neon DB...');
    const sql = neon(process.env.DATABASE_URL as string);
    console.log('Verify API: Connected to Neon DB.');

    // Get the credential from the database
    console.log('Verify API: Looking up credential in DB with ID:', credential.id);
    
    // Convert Base64URL to standard Base64
    const standardBase64 = credential.id
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    console.log('Verify API: Converted to standard Base64:', standardBase64);
    
    const storedCredential = await sql`
        SELECT pc.*, u.id as user_id 
        FROM passkey_credentials pc 
        JOIN users u ON pc.user_id = u.id 
        WHERE pc.id = decode(${standardBase64}, 'base64')
    `;

    if (storedCredential.length === 0) {
        console.error('Verify API: Credential not found in database');
        return res.status(401).json({ message: 'Invalid credential' });
    }

    const credentialRecord = storedCredential[0];
    console.log('Verify API: Found credential in DB for user:', credentialRecord.user_id);

    // Configure verifyAuthenticationResponse options
    const verificationOptions = {
        response: credentialForVerification,
        expectedChallenge: expectedChallengeString,
        expectedOrigin: process.env.NEXT_PUBLIC_WEB_ORIGIN as string,
        expectedRPID: process.env.NEXT_PUBLIC_WEB_ORIGIN?.replace(/^https?:\/\//, '') as string,
        authenticator: {
            credentialPublicKey: credentialRecord.public_key,
            credentialID: credential.id,
            counter: credentialRecord.sign_counter,
        },
        requireUserVerification: true,
        credential: {
            id: credential.id,
            publicKey: credentialRecord.public_key,
            counter: credentialRecord.sign_counter,
        },
    };

    console.log('Verify API: Verification options being passed to verifyAuthenticationResponse:', {
        ...verificationOptions,
        response: {
            ...verificationOptions.response,
            response: {
                ...verificationOptions.response.response,
                clientDataJSON: verificationOptions.response.response.clientDataJSON.substring(0, 100) + '...',
                authenticatorData: verificationOptions.response.response.authenticatorData.substring(0, 100) + '...',
                signature: verificationOptions.response.response.signature.substring(0, 100) + '...',
            },
        },
    });

    let verification;
    try {
        verification = await verifyAuthenticationResponse(verificationOptions);
        console.log('Verify API: Passkey verification successful.', verification);
    } catch (verificationError) {
        console.error('Verify API: Passkey verification failed:', verificationError);
        return res.status(401).json({ message: 'Passkey verification failed' });
    }

    const { verified, authenticationInfo } = verification;

    if (!verified) {
        console.error('Verify API: Verification result not as expected.', verification);
        return res.status(401).json({ message: 'Passkey verification failed' });
    }

    // Update the credential's counter
    await sql`
        UPDATE passkey_credentials 
        SET sign_counter = ${authenticationInfo.newCounter} 
        WHERE id = ${credential.id}
    `;
    console.log('Verify API: Updated credential counter in DB');

    // Set the user session
    session.user = {
        id: credentialRecord.user_id,
        authenticated: true,
    }
    await session.save()
    console.log('Verify API: Session saved.');

    console.log('Verify API: Authentication successful.');
    res.status(200).json({ success: true, userId: credentialRecord.user_id })
  } catch (error) {
    console.error('Verify API: Error in catch block:', error)
    res.status(401).json({ message: 'Authentication failed' })
  }
} 