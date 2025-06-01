import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { invitationId } = req.body

    if (!invitationId) {
      return res.status(400).json({ message: 'Invitation ID is required' })
    }

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    })

    // Generate a random invitation code
    const invitationCode = crypto.randomBytes(16).toString('hex')

    // Update the invitation document with the code
    await client
      .patch(invitationId)
      .set({
        code: invitationCode,
        used: false,
      })
      .commit()

    // Generate the invitation link
    const invitationLink = `https://antoines.app/register?code=${invitationCode}`

    res.status(200).json({ invitationLink })
  } catch (error) {
    console.error('Error generating invitation:', error)
    res.status(500).json({ message: 'Error generating invitation' })
  }
} 