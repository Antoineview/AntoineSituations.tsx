import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import HeroPost from 'components/HeroPost'
import MoreStories from 'components/MoreStories'
import Categories from 'components/Categories'
import type { Post, Settings, Category } from 'lib/sanity.queries'
import Head from 'next/head'

export default function IndexPage(props: {
  preview?: boolean
  loading?: boolean
  posts: Post[]
  settings: Settings
  categories?: Category[]
}) {
  const { preview, loading, posts, settings, categories = [] } = props
  const [heroPost, ...morePosts] = posts
  const { title = 'titre' } = settings
  const { lilparagraph = 'description' } = settings

  return (
    <>
      <Layout preview={preview} loading={loading}>
        <Head>
          <title>{title}</title>
        </Head>
        <Container>
          <div className="w-full">
            <BlogHeader 
              title={title} 
              lilparagraph={lilparagraph} 
              bigparapraph=""
            />
          </div>
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              date={heroPost.date}
              
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
           {categories && categories.length > 0 && <Categories categories={categories} />}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
         
        </Container>
      </Layout>
    </>
  )
}
