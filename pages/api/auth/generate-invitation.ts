import crypto from 'crypto'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Generate Invitation API: Received request')
    const { invitationId } = req.body

    console.log('Generate Invitation API: invitationId:', invitationId)

    if (!invitationId) {
      console.error('Generate Invitation API: Missing invitationId')
      return res.status(400).json({ message: 'Invitation ID is required' })
    }

    const token = process.env.SANITY_API_TOKEN
    console.log(
      'Generate Invitation API: Token present:',
      !!token,
      token ? `(Length: ${token.length})` : '',
    )

    if (!token) {
      console.error('Generate Invitation API: Missing SANITY_API_TOKEN')
      return res.status(500).json({ message: 'Server configuration error' })
    }

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })

    // Generate a random invitation code
    const invitationCode = crypto.randomBytes(16).toString('hex')
    console.log('Generate Invitation API: Generated code:', invitationCode)

    // Update the invitation document with the code
    console.log('Generate Invitation API: Patching document...')
    await client
      .patch(invitationId)
      .set({
        code: invitationCode,
        used: false,
      })
      .commit()

    console.log('Generate Invitation API: Document patched successfully')

    // Generate the invitation link
    const invitationLink = `https://antoines.app/register?code=${invitationCode}`

    res.status(200).json({ invitationLink })
  } catch (error) {
    console.error('Error generating invitation:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    res.status(500).json({ message: 'Error generating invitation' })
  }
}
