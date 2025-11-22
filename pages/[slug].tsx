import Page from 'components/Page'
import { apiVersion, dataset, projectId, readToken } from 'lib/sanity.api'
import { getClient } from 'lib/sanity.client'
import {
    pageQuery,
    pageSlugsQuery,
} from 'lib/sanity.queries'
import type {
    GetStaticPaths,
    GetStaticProps,
    InferGetStaticPropsType,
} from 'next'
import { VisualEditing } from '@sanity/visual-editing/next-pages-router'

export const getStaticPaths: GetStaticPaths = async () => {
    let paths = []
    if (projectId) {
        const client = getClient()
        paths = await client.fetch(pageSlugsQuery)
    }

    return {
        paths: paths.map((slug) => ({ params: { slug } })),
        fallback: true,
    }
}

export const getStaticProps: GetStaticProps<
    {
        preview?: boolean
        token: null | string
        page: any
    },
    { slug: string },
    { token?: string }
> = async ({ params, preview = false, previewData = {} }) => {
    const token = previewData?.token || readToken || null
    const client = getClient(preview ? { token } : undefined)

    const page = await client.fetch(pageQuery, { slug: params.slug })

    if (!page) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            preview,
            token,
            page,
        },
        revalidate: 60,
    }
}

export default function PageRoute(
    props: InferGetStaticPropsType<typeof getStaticProps>,
) {
    const { preview, page } = props

    if (!page) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Page page={page} preview={preview} />
            {preview && <VisualEditing />}
        </>
    )
}
