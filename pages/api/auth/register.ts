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

    if (!invitation || invitation.used) {
        console.log('Register API: Invalid or used invitation');
        return res.status(400).json({ message: 'Invalid or used invitation' });
    }
    console.log('Register API: Invitation is valid and unused.');

    // Connect to Neon database
    console.log('Register API: Connecting to Neon DB...');
    const sql = neon(process.env.DATABASE_URL as string);
    console.log('Register API: Connected to Neon DB.');

    // 1. Create a new user
    console.log('Register API: Inserting new user into DB...', { invitationId });
    const newUser = await sql`INSERT INTO users (invitation_id) VALUES (${invitationId}) RETURNING id`;
    const userId = newUser[0].id; // Assuming the result is an array with one row
    console.log('Register API: New user created with ID:', userId);

    // 2. Store the passkey credential
    console.log('Register API: Storing passkey credential...');
    const credentialId = arrayNumToBuffer(credential.rawId);
    const publicKey = arrayNumToBuffer(credential.response.authenticatorData); // Simplified
    const signCounter = 0;
    const transports = credential.response.transports;

    console.log('Register API: Credential data prepared.', { credentialId, userId, signCounter, transports });

    await sql`INSERT INTO passkey_credentials (id, user_id, public_key, sign_counter, transports) VALUES (${credentialId}, ${userId}, ${publicKey}, ${signCounter}, ${transports})`;
    console.log('Register API: Passkey credential stored in DB.');

    // 3. Mark the invitation as used in Sanity
    console.log('Register API: Patching invitation in Sanity...', { invitationId });
    await sanityClient
      .patch(invitationId)
      .set({ used: true })
      .commit()
    console.log('Register API: Invitation marked as used in Sanity.');

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
    // Provide a more generic error message for the client
    res.status(500).json({ message: 'Registration failed' })
  }
} 