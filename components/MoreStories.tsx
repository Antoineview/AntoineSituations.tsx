import React, { useState, useEffect, useRef } from 'react'
import PostPreview from 'components/PostPreview'
import type { Post } from 'lib/sanity.queries'
import { motion, AnimatePresence } from 'framer-motion'

export default function MoreStories({ posts, hideTitle }: { posts: Post[], hideTitle?: boolean }) {
  const [visiblePosts, setVisiblePosts] = useState(4)
  const hasMorePosts = posts.length > visiblePosts
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMorePosts) {
        setVisiblePosts(prev => prev + 4)
      }
    }, options)

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMorePosts])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  }

  return (
    <section className="morecardcontainer">
      {!hideTitle && (
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl morecardh1"
        >
          plus.
        </motion.h1>
      )}
      <motion.div 
        className="mb-6 grid grid-cols-1 gap-y-1 md:grid-cols-2 md:gap-x-5 md:gap-y-5 lg:gap-x-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {posts.slice(0, visiblePosts).map((post, index) => (
            <motion.div
              key={post._id}
              variants={itemVariants}
              layout
            >
              <PostPreview
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                slug={post.slug}
                excerpt={post.excerpt}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {hasMorePosts && (
        <div ref={loadMoreRef} className="h-10" />
      )}
    </section>
  )
}
