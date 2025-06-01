import { NextApiRequest, NextApiResponse } from 'next'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'

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
    const { credential, authorId } = req.body

    if (!credential || !authorId) {
      return res.status(400).json({ message: 'Credential and authorId are required' })
    }

    const session = await getIronSession<IronSessionData>(req, res, sessionOptions)

    // In a real implementation, you would:
    // 1. Verify the challenge from the session matches the one in clientDataJSON
    // 2. Store the credential ID and public key in your database
    // 3. Associate the credential with a user account

    // For now, we'll just set the user as authenticated
    session.user = {
      id: authorId,
      authenticated: true,
    }
    await session.save()

    // Mark the invitation as used
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    })

    await client
      .patch(authorId)
      .set({ invitationUsed: true })
      .commit()

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({ message: 'Registration failed' })
  }
} 