/**
 * This code is responsible for revalidating the cache when a post or author is updated.
 *
 * It is set up to receive a validated GROQ-powered Webhook from Sanity.io:
 * https://www.sanity.io/docs/webhooks
 *
 * 1. Go to the API section of your Sanity project on sanity.io/manage or run `npx sanity hook create`
 * 2. Click "Create webhook"
 * 3. Set the URL to https://YOUR_NEXTJS_SITE_URL/api/revalidate
 * 4. Trigger on: "Create", "Update", and "Delete"
 * 5. Filter: _type == "post" || _type == "author" || _type == "settings"
 * 6. Projection: Leave empty
 * 7. HTTP method: POST
 * 8. API version: v2021-03-25
 * 9. Include drafts: No
 * 10. HTTP Headers: Leave empty
 * 11. Secret: Set to the same value as SANITY_REVALIDATE_SECRET (create a random one if you haven't)
 * 12. Save the cofiguration
 * 13. Add the secret to Vercel: `npx vercel env add SANITY_REVALIDATE_SECRET`
 * 14. Redeploy with `npx vercel --prod` to apply the new environment variable
 */

// @TODO move the heavy duty body parsing logic into `next-sanity/webhook`

import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { createClient } from 'next-sanity'
import { NextApiRequest, NextApiResponse } from 'next'
import { groq } from 'next-sanity'

// Next.js will by default parse the body, which can lead to invalid signatures
export const config = {
  api: {
    bodyParser: false,
  },
}

const AUTHOR_UPDATED_QUERY = /* groq */ `
  *[_type == "author" && _id == $id] {
    "slug": *[_type == "post" && references(^._id)].slug.current
  }["slug"][]`
const POST_UPDATED_QUERY = /* groq */ `*[_type == "post" && _id == $id].slug.current`
const SETTINGS_UPDATED_QUERY = /* groq */ `*[_type == "post"].slug.current`

const getQueryForType = (type) => {
  switch (type) {
    case 'author':
      return AUTHOR_UPDATED_QUERY
    case 'post':
      return POST_UPDATED_QUERY
    case 'settings':
      return SETTINGS_UPDATED_QUERY
    default:
      throw new TypeError(`Unknown type: ${type}`)
  }
}

const log = (msg, error?) =>
  console[error ? 'error' : 'log'](`[revalidate] ${msg}`)

async function readBody(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export default async function revalidate(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  const signatureHeader = req.headers[SIGNATURE_HEADER_NAME]
  const signature = Array.isArray(signatureHeader)
    ? signatureHeader[0]
    : signatureHeader
  const body = await readBody(req) // Read the body into a string
  if (
    !isValidSignature(
      body,
      signature || '',
      process.env.SANITY_REVALIDATE_SECRET?.trim(),
    )
  ) {
    const invalidSignature = 'Invalid signature'
    log(invalidSignature, true)
    res.status(401).json({ success: false, message: invalidSignature })
    return
  }

  const jsonBody = JSON.parse(body)
  const { _id: id, _type } = jsonBody
  if (typeof id !== 'string' || !id) {
    const invalidId = 'Invalid _id'
    log(invalidId, true)
    return res.status(400).json({ message: invalidId })
  }

  log('Wait a second to give Elastic Search time to reach eventual consistency')
  await new Promise((resolve) => setTimeout(resolve, 1000))

  log(`Querying post slug for _id '${id}', type '${_type}' ..`)
  const client = createClient({ projectId, dataset, apiVersion, useCdn: true })
  const slug = await client.fetch(getQueryForType(_type), { id })
  const slugs = (Array.isArray(slug) ? slug : [slug]).map(
    (_slug) => `/posts/${_slug}`,
  )
  const staleRoutes = ['/', ...slugs]

  try {
    await Promise.all(staleRoutes.map((route) => res.revalidate(route)))
    const updatedRoutes = `Updated routes: ${staleRoutes.join(', ')}`
    log(updatedRoutes)
    return res.status(200).json({ message: updatedRoutes })
  } catch (err) {
    log(err.message, true)
    return res.status(500).json({ message: err.message })
  }
}
