import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import PostPreview from 'components/PostPreview'
import type { Post } from 'lib/sanity.queries'
import { motion, AnimatePresence } from 'framer-motion'

const groupPostsBySemester = (posts: Post[]) => {
  return posts.reduce(
    (groups, post) => {
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
    },
    {} as Record<string, Post[]>,
  )
}

// Debounce function to limit how often a function can be called
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default function MoreStories({
  posts,
  hideTitle,
}: {
  posts: Post[]
  hideTitle?: boolean
}) {
  const [visiblePosts, setVisiblePosts] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const hasMorePosts = posts.length > visiblePosts
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Cache the grouped posts
  const groupedPosts = useMemo(() => groupPostsBySemester(posts), [posts])

  // Cache the visible semesters calculation
  const visibleSemesters = useMemo(
    () => Object.keys(groupedPosts).slice(0, Math.ceil(visiblePosts / 2)),
    [groupedPosts, visiblePosts],
  )

  const loadMore = useCallback(() => {
    if (hasMorePosts && !isLoading) {
      setIsLoading(true)
      setVisiblePosts((prev) => prev + 2)
      // Reset loading state after animation completes
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [hasMorePosts, isLoading])

  // Debounced load more function
  const debouncedLoadMore = useMemo(() => debounce(loadMore, 100), [loadMore])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px 0px', // Increased margin for earlier loading
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        debouncedLoadMore()
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
  }, [debouncedLoadMore])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Reduced stagger time for faster loading
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5, // Reduced duration for faster animations
        delay: index * 0.05, // Reduced delay between items
        ease: [0.4, 0, 0.2, 1], // Smoother easing curve
      },
    }),
    exit: (index: number) => ({
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        delay: index * 0.02,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  }

  return (
    <section className="morecardcontainer">
      {!hideTitle && (
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6 sm:mb-8 text-6xl sm:text-7xl md:text-7xl font-bold leading-tight tracking-tighter morecardh1"
        >
          tout.
        </motion.h1>
      )}
      {visibleSemesters.map((semesterYear) => (
        <motion.div
          key={semesterYear}
          className="mb-8 sm:mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold tracking-tight"
            variants={itemVariants}
          >
            {semesterYear}
          </motion.h2>
          <motion.div
            className="mb-6 grid grid-cols-1 gap-y-4 sm:gap-y-6 md:grid-cols-2 md:gap-x-5 lg:gap-x-3"
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
                  viewport={{ once: false, margin: '-50px' }}
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
        <div ref={loadMoreRef} className="h-10">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
      )}
    </section>
  )
}
