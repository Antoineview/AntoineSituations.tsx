import Container from 'components/BlogContainer'
import BlogHeader from 'components/BlogHeader'
import Layout from 'components/BlogLayout'
import MoreStories from 'components/MoreStories'
import PostBody from 'components/PostBody'
import PostHeader from 'components/PostHeader'
import PostTitle from 'components/PostTitle'
import SectionSeparator from 'components/SectionSeparator'
import { motion } from 'framer-motion'
import { urlForImage } from 'lib/sanity.image'
import type { Post, Settings } from 'lib/sanity.queries'
import ErrorPage from 'next/error'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

import AuthGate from './AuthGate'

export default function PostPage(props: {
  preview?: boolean
  loading?: boolean
  data: { post: Post; morePosts: Post[] }
  settings: Settings
}) {
  const { preview, loading, data, settings } = props
  const { post = {} as any, morePosts = [] } = data || {}
  const { title = 'antoine.tsx' } = settings || {}
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()

  const slug = post?.slug

  if (!router.isFallback && !slug && !preview) {
    return <ErrorPage statusCode={404} />
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    }),
  }

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  const content = (
    <>
      <motion.article
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Head>
          <title>{`${post.title} | ${title}`}</title>
          <meta
            name="description"
            content={post.excerpt || `Article by Antoine RICHARD-CAPPONI`}
          />
          <meta
            name="author"
            content={post.auteur?.name || 'Antoine RICHARD-CAPPONI'}
          />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.title} />
          <meta
            property="og:description"
            content={post.excerpt || `Article by Antoine RICHARD-CAPPONI`}
          />
          <meta property="og:site_name" content={title} />
          <meta property="article:published_time" content={post.date} />
          {post.auteur?.name && (
            <meta property="article:author" content={post.auteur.name} />
          )}
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

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta
            name="twitter:description"
            content={post.excerpt || `Article by Antoine RICHARD-CAPPONI`}
          />
          {post.coverImage?.asset?._ref && (
            <meta
              name="twitter:image"
              content={urlForImage(post.coverImage)
                .width(1200)
                .height(627)
                .fit('crop')
                .url()}
            />
          )}
        </Head>
        <motion.div variants={itemVariants} custom={1}>
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            auteur={post.auteur}
            _id={post._id}
          />
        </motion.div>
        <motion.div
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-100px' }}
        >
          <PostBody content={post.content} />
        </motion.div>
      </motion.article>
      <motion.div variants={itemVariants} custom={2}>
        <SectionSeparator />
      </motion.div>
      {morePosts.length > 0 && (
        <motion.div variants={itemVariants} custom={3}>
          <MoreStories posts={morePosts} />
        </motion.div>
      )}
    </>
  )

  return (
    <Layout preview={preview} loading={loading}>
      <Container>
        <BlogHeader lilparagraph={''} bigparapraph={''} title={title} />
        <motion.div
          className="mb-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <button
            onClick={() => router.back()}
            className="text-lg font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
          >
            ← Back
          </button>
        </motion.div>
        {router.isFallback || (preview && !post) ? (
          <PostTitle>chargement...</PostTitle>
        ) : post.requiresAuth && !isAuthenticated ? (
          <AuthGate onAuthenticated={() => setIsAuthenticated(true)}>
            {content}
          </AuthGate>
        ) : (
          content
        )}
      </Container>
    </Layout>
  )
}
