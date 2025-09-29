import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import MoreStories from 'components/MoreStories'
import { apiVersion, dataset, projectId, readToken } from 'lib/sanity.api'
import type { Post } from 'lib/sanity.queries'
import { categoriesQuery, postsByCategoryQuery } from 'lib/sanity.queries'
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { createClient } from 'next-sanity'

interface Category {
  _id: string
  title: string
  slug: string
  description: string
  color: string
}

export default function CategoryPage({
  data: { posts, category },
  preview,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()

  return (
    <Layout preview={preview}>
      <Head>
        <title>{`${category.title} | antoine.tsx`}</title>
      </Head>
      <Container>
        <div className="w-full">
          <BlogHeader title={category.title} lilparagraph="" bigparapraph="" />
        </div>
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-lg font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            ← Back
          </button>
        </div>
        {posts.length > 0 && <MoreStories posts={posts} hideTitle />}
      </Container>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: readToken || undefined,
    })
    const categories = await client.fetch<Category[]>(categoriesQuery)

    return {
      paths: categories.map((category) => ({
        params: { slug: category.slug },
      })),
      fallback: false,
    }
  }

  return {
    paths: [],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: readToken || undefined,
    })

    const category = await client.fetch<Category>(
      `*[_type == "category" && slug.current == $slug][0]`,
      { slug: params?.slug },
    )
    const posts = await client.fetch<Post[]>(postsByCategoryQuery, {
      categorySlug: params?.slug,
    })

    return {
      props: {
        data: {
          category,
          posts,
        },
        preview: false,
      },
      revalidate: 60,
    }
  }

  return {
    props: {
      data: {
        category: null,
        posts: [],
      },
      preview: false,
    },
  }
}
