import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import MoreStories from 'components/MoreStories'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { postsByCategoryQuery, categoriesQuery } from 'lib/sanity.queries'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { createClient } from 'next-sanity'
import Head from 'next/head'
import type { Post } from 'lib/sanity.queries'

interface Category {
  _id: string
  title: string
  slug: string
  description: string
  color: string
}

export default function CategoryPage({
  category,
  posts,
}: {
  category: Category
  posts: Post[]
}) {
  return (
    <Layout preview={false}>
      <Head>
        <title>{`${category.title} | antoine.tsx`}</title>
      </Head>
      <Container>
        <BlogHeader
          title={category.title}
          lilparagraph={category.description}
          bigparapraph=""
          level={1}
        />
        {posts.length > 0 && <MoreStories posts={posts} />}
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
    })

    const category = await client.fetch<Category>(
      `*[_type == "category" && slug.current == $slug][0]`,
      { slug: params?.slug }
    )

    const posts = await client.fetch<Post[]>(postsByCategoryQuery, {
      categorySlug: params?.slug,
    })

    return {
      props: {
        category,
        posts,
      },
      revalidate: 60,
    }
  }

  return {
    props: {
      category: null,
      posts: [],
    },
  }
} 