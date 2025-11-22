import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId, readToken, useCdn } from './sanity.api'

export function getClient(preview?: { token?: string }): SanityClient {
    const client = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn,
        token: readToken,
        perspective: 'published',
        stega: {
            enabled: preview?.token ? true : false,
            studioUrl: '/studio',
        },
    })
    if (preview) {
        if (!preview.token) {
            throw new Error('You must provide a token to preview drafts')
        }
        return client.withConfig({
            token: preview.token,
            useCdn: false,
            ignoreBrowserTokenWarning: true,
            perspective: 'previewDrafts',
        })
    }
    return client
}

export const client = getClient()

