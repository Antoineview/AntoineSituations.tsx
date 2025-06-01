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
    const { credential, invitationId } = req.body

    if (!credential || !invitationId) {
      return res.status(400).json({ message: 'Credential and invitationId are required' })
    }

    // Connect to Sanity to check invitation status
    const sanityClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    })

    const invitation = await sanityClient.getDocument(invitationId);

    if (!invitation || invitation.used) {
        return res.status(400).json({ message: 'Invalid or used invitation' });
    }

    // Connect to Neon database
    const sql = neon(process.env.DATABASE_URL as string);

    // 1. Create a new user
    // Using INSERT ... RETURNING to get the generated user ID
    const newUser = await sql`INSERT INTO users (invitation_id) VALUES (${invitationId}) RETURNING id`;
    const userId = newUser[0].id; // Assuming the result is an array with one row

    // 2. Store the passkey credential
    const credentialId = arrayNumToBuffer(credential.rawId);
    const publicKey = arrayNumToBuffer(credential.response.authenticatorData); // Simplified: Use authenticatorData for public key storage placeholder
    // In a real implementation, you would parse the attestation object to get the actual public key
    const signCounter = 0; // Initial sign counter
    const transports = credential.response.transports; // Assuming transports are provided

    await sql`INSERT INTO passkey_credentials (id, user_id, public_key, sign_counter, transports) VALUES (${credentialId}, ${userId}, ${publicKey}, ${signCounter}, ${transports})`;

    // 3. Mark the invitation as used in Sanity
    await sanityClient
      .patch(invitationId)
      .set({ used: true })
      .commit()

    // 4. Set the user session
    const session = await getIronSession<IronSessionData>(req, res, sessionOptions)
    session.user = {
      id: userId,
      authenticated: true,
    }
    await session.save()

    res.status(200).json({ success: true, userId: userId })

  } catch (error) {
    console.error('Registration error:', error)
    // Note: In a real app, handle specific errors (e.g., database errors, Sanity errors)
    res.status(500).json({ message: 'Registration failed' })
  }
} 