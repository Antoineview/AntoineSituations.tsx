import { isoBase64URL } from '@simplewebauthn/server/helpers'
import crypto from 'crypto'
import type { IronSessionData } from 'iron-session'
import { getIronSession } from 'iron-session'
import { NextApiRequest, NextApiResponse } from 'next'

interface CustomSessionData extends IronSessionData {
  challengeData?: {
    buffer: number[]
  }
  user?: {
    id: string
    authenticated: boolean
  }
}

const sessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Generate a random challenge
  const challenge = crypto.randomBytes(32)

  // Store the challenge in the session as an array of numbers
  const session = await getIronSession<CustomSessionData>(
    req,
    res,
    sessionOptions,
  )
  session.challengeData = {
    buffer: Array.from(challenge),
  }
  await session.save()

  // Convert challenge to Base64URL for the client
  const challengeString = isoBase64URL.fromBuffer(challenge)
  console.log('Challenge API: Generated challenge:', challengeString)

  // Send the challenge as an array of numbers to the client
  res.status(200).json({ challenge: Array.from(challenge) })
}
