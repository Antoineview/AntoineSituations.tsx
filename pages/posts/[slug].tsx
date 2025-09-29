import PostPage from 'components/PostPage'
import { apiVersion, dataset, projectId, readToken } from 'lib/sanity.api'
import {
  type Post,
  postQuery,
  postSlugsQuery,
  type Settings,
  settingsQuery,
} from 'lib/sanity.queries'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next'
import { createClient } from 'next-sanity'
import { lazy, Suspense } from 'react'

const PreviewPostPage = lazy(() => import('components/PreviewPostPage'))

export const getStaticPaths: GetStaticPaths = async () => {
  let paths = []
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: readToken || undefined,
    })
    paths = await client.fetch(postSlugsQuery)
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
    data: { post: Post; morePosts: Post[] }
    settings: Settings
  },
  { slug: string },
  { token?: string }
> = async ({ params, preview = false, previewData = {} }) => {
  const token = previewData?.token || readToken || null
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: token || undefined,
  })
  const dataPromise = client.fetch<{ post: Post; morePosts: Post[] }>(
    postQuery,
    { slug: params.slug },
  )
  const settingsPromise = client.fetch<Settings>(settingsQuery)

  return {
    props: {
      preview,
      token,
      data: (await dataPromise) || { post: {} as any, morePosts: [] },
      settings: (await settingsPromise) || {},
    },
    // If webhooks isn't setup then attempt to re-generate in 1 minute intervals
    revalidate: process.env.SANITY_REVALIDATE_SECRET ? undefined : 60,
  }
}

export default function PostRoute(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { preview, token, data, settings } = props

  if (preview) {
    return (
      <Suspense
        fallback={<PostPage preview loading data={data} settings={settings} />}
      >
        <PreviewPostPage token={token} slug={data?.post?.slug} />
      </Suspense>
    )
  }

  return <PostPage data={data} settings={settings} />
}
