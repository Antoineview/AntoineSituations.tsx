import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { postBySlugQuery } from 'lib/sanity.queries'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Invalid slug' })
  }

  try {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    })

    const post = await client.fetch(postBySlugQuery, { slug })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    res.status(200).json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({ message: 'Error fetching post' })
  }
}
