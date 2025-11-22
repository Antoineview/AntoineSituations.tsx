import { apiVersion, dataset, previewSecretId, projectId, readToken } from 'lib/sanity.api'
import { getSecret } from 'plugins/productionUrl/utils'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!readToken) {
        res.status(500).send('Misconfigured server')
        return
    }

    const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token: readToken })
    const secret = await getSecret(client, previewSecretId)

    if (!req.query.secret || req.query.secret !== secret) {
        return res.status(401).send('Invalid secret')
    }

    res.setPreviewData({ token: readToken })
    res.writeHead(307, { Location: (req.query.slug as string) || '/' })
    res.end()
}
