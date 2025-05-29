import React, { useState, useEffect, useRef, useMemo } from 'react'
import PostPreview from 'components/PostPreview'
import type { Post } from 'lib/sanity.queries'
import { motion, AnimatePresence } from 'framer-motion'

const groupPostsBySemester = (posts: Post[]) => {
  return posts.reduce((groups, post) => {
    const date = new Date(post.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // getMonth() returns 0-11
    const semester = month <= 6 ? 'Spring' : 'Fall'
    const semesterYear = `${semester} ${year}`
    
    if (!groups[semesterYear]) {
      groups[semesterYear] = []
    }
    groups[semesterYear].push(post)
    return groups
  }, {} as Record<string, Post[]>)
}

export default function MoreStories({ posts, hideTitle }: { posts: Post[], hideTitle?: boolean }) {
  const [visiblePosts, setVisiblePosts] = useState(2)
  const hasMorePosts = posts.length > visiblePosts
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Cache the grouped posts
  const groupedPosts = useMemo(() => groupPostsBySemester(posts), [posts])
  
  // Cache the visible semesters calculation
  const visibleSemesters = useMemo(() => 
    Object.keys(groupedPosts).slice(0, Math.ceil(visiblePosts / 2)),
    [groupedPosts, visiblePosts]
  )

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMorePosts) {
        setVisiblePosts(prev => prev + 2)
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
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }),
    exit: (index: number) => ({
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    })
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
      {visibleSemesters.map((semesterYear) => (
        <motion.div 
          key={semesterYear}
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="mb-6 text-3xl font-bold tracking-tight"
            variants={itemVariants}
          >
            {semesterYear}
          </motion.h2>
          <motion.div 
            className="mb-6 grid grid-cols-1 gap-y-1 md:grid-cols-2 md:gap-x-5 md:gap-y-5 lg:gap-x-3"
            variants={containerVariants}
          >
            <AnimatePresence mode="popLayout">
              {groupedPosts[semesterYear].map((post, index) => (
                <motion.div
                  key={post._id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, margin: "-100px" }}
                  exit="exit"
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
        </motion.div>
      ))}
      {hasMorePosts && (
        <div ref={loadMoreRef} className="h-10" />
      )}
    </section>
  )
}
