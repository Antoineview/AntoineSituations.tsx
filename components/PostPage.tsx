import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import MoreStories from 'components/MoreStories'
import PostBody from 'components/PostBody'
import PostHeader from 'components/PostHeader'
import PostTitle from 'components/PostTitle'
import SectionSeparator from 'components/SectionSeparator'
import { urlForImage } from 'lib/sanity.image'
import type { Post, Settings, fileQuery } from 'lib/sanity.queries'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function PostPage(props: {
  preview?: boolean
  loading?: boolean
  data: { post: Post; morePosts: Post[] }
  settings: Settings
}) {
  const { preview, loading, data, settings } = props
  const { post = {} as any, morePosts = [] } = data || {}
  const { title = 'antoine.tsx' } = settings || {}

  const router = useRouter()

  const slug = post?.slug

  if (!router.isFallback && !slug && !preview) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Layout preview={preview} loading={loading}>
      <Container>
        <BlogHeader
          lilparagraph={''}
          bigparapraph={''}
          title={title}
        />
        <div className="mb-8">
          <Link href="/" className="text-lg font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
            ← Return Home
          </Link>
        </div>
        {router.isFallback || (preview && !post) ? (
          <PostTitle>chargement...</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>{`${post.title} | ${title}`}</title>
                {post.coverImage?.asset?._ref && (
                  <meta
                    key="ogImage"
                    property="og:image"
                    content={urlForImage(post.coverImage)
                      .width(1200)
                      .height(627)
                      .fit('crop')
                      .url()}
                  />
                )}
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                auteur={post.auteur}
              />
              <PostBody content={post.content}></PostBody>
            </article>
            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
        )}
      </Container>
    </Layout>
  )
}
