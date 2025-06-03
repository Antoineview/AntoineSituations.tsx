import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Invitation code is required' })
    }

    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    })

    // Find the invitation with the matching code
    const invitation = await client.fetch(
      `*[_type == "invitation" && code == $code][0]`,
      { code },
    )

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid invitation code' })
    }

    if (invitation.used) {
      return res
        .status(400)
        .json({ message: 'Invitation code has already been used' })
    }

    res.status(200).json({ valid: true, invitationId: invitation._id })
  } catch (error) {
    console.error('Error validating invitation:', error)
    res.status(500).json({ message: 'Error validating invitation' })
  }
}
