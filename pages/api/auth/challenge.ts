import { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'
import { isoBase64URL } from '@simplewebauthn/server/helpers'

interface CustomSessionData extends IronSessionData {
  challenge?: string;
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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Generate a random challenge
  const challenge = crypto.randomBytes(32)
  
  // Convert challenge to Base64URL string for storage
  const challengeString = isoBase64URL.fromBuffer(challenge)

  // Store the challenge in the session
  const session = await getIronSession<CustomSessionData>(req, res, sessionOptions)
  session.challenge = challengeString
  await session.save()

  res.status(200).json({ challenge: Array.from(challenge) })
} 