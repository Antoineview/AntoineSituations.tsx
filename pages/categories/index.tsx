import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { categoriesQuery } from 'lib/sanity.queries'
import type { GetStaticProps } from 'next'
import { createClient } from 'next-sanity'
import Link from 'next/link'
import Head from 'next/head'

interface Category {
  _id: string
  title: string
  slug: string
  description: string
  color: string
}

export default function CategoriesPage({ categories }: { categories: Category[] }) {
  return (
    <Layout preview={false}>
      <Head>
        <title>Catégories | antoine.tsx</title>
      </Head>
      <Container>
        <BlogHeader title="Catégories" lilparagraph="" bigparapraph="" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group rounded-lg border border-gray-200 p-6 transition-colors hover:border-gray-300"
            >
              <div
                className="mb-4 h-3 w-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h2 className="mb-2 text-2xl font-bold tracking-tight group-hover:text-gray-600">
                {category.title}
              </h2>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  if (projectId) {
    const client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    })
    const categories = await client.fetch<Category[]>(categoriesQuery)

    return {
      props: {
        categories,
      },
      revalidate: 60,
    }
  }

  return {
    props: {
      categories: [],
    },
  }
} 