import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'

const sessionOptions = {
  password: process.env.SESSION_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Generate a random challenge
  const challenge = crypto.randomBytes(32)

  // Store the challenge in the session
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions)
  session.challenge = challenge
  await session.save()

  res.status(200).json({ challenge: Array.from(challenge) })
} 