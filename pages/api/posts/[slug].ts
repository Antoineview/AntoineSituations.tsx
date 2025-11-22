import { apiVersion, dataset, projectId, readToken } from 'lib/sanity.api'
import { postBySlugQuery } from 'lib/sanity.queries'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'
import { getIronSession } from 'iron-session'
import { sessionOptions } from 'lib/session'
import type { IronSessionData } from 'iron-session'

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
      token: readToken || undefined,
    })

    const post = await client.fetch(postBySlugQuery, { slug })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Check if post requires authentication
    if (post.requiresAuth) {
      const session = await getIronSession<IronSessionData>(
        req,
        res,
        sessionOptions,
      )

      // If not authenticated, return 401
      if (!session.user?.authenticated) {
        return res.status(401).json({ message: 'Authentication required' })
      }
    }

    res.status(200).json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({ message: 'Error fetching post' })
  }
}
