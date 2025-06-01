import IndexPage from 'components/IndexPage'
import PreviewIndexPage from 'components/PreviewIndexPage'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import {
  type Post,
  type Settings,
  type Category,
  indexQuery,
  settingsQuery,
  categoriesQuery,
} from 'lib/sanity.queries'
import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { createClient } from 'next-sanity'
import { Suspense } from 'react'

export const getStaticProps: GetStaticProps<
  { preview: boolean; token: string | null; posts: Post[]; settings: Settings; categories: Category[] },
  any,
  { token?: string }
> = async ({ preview = false, previewData = {} }) => {
  /* check if the project id has been defined by fetching the vercel envs */
  if (projectId) {
    const token = previewData?.token || null
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: !preview,
    })
    const postsPromise = client.fetch<Post[]>(indexQuery)
    const settingsPromise = client.fetch<Settings>(settingsQuery)
    const categoriesPromise = client.fetch<Category[]>(categoriesQuery)

    return {
      props: {
        preview,
        token,
        posts: (await postsPromise) || [],
        settings: (await settingsPromise) || {},
        categories: (await categoriesPromise) || [],
      },
      // If webhooks isn't setup then attempt to re-generate in 1 minute intervals
      revalidate: process.env.SANITY_REVALIDATE_SECRET ? undefined : 60,
    }
  }

  /* when the client isn't set up */
  return {
    props: { preview: false, token: null, posts: [], settings: {}, categories: [] },
    revalidate: undefined,
  }
}

export default function IndexRoute({
  preview,
  token,
  posts,
  settings,
  categories,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (preview) {
    return (
      <Suspense
        fallback={
          <IndexPage preview loading posts={posts} settings={settings} categories={categories || []} />
        }
      >
        <PreviewIndexPage token={token} />
      </Suspense>
    )
  }

  return <IndexPage posts={posts} settings={settings} categories={categories || []} />
}
