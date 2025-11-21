import PostPreview from 'components/PostPreview'
import { AnimatePresence, motion } from 'framer-motion'
import type { Post } from 'lib/sanity.queries'
import React, { useEffect, useMemo } from 'react'

import { useAnimation } from './AnimationContext'

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

export default function MoreStories({
  posts,
  hideTitle,
}: {
  posts: Post[]
  hideTitle?: boolean
}) {
  const { shouldAnimate, markAnimated } = useAnimation()

  useEffect(() => {
    if (shouldAnimate) {
      markAnimated()
    }
  }, [shouldAnimate, markAnimated])

  // Cache the grouped posts
  const groupedPosts = useMemo(() => groupPostsBySemester(posts), [posts])

  // Get all semesters
  const allSemesters = useMemo(() => Object.keys(groupedPosts), [groupedPosts])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1] as any,
      },
    }),
    exit: (index: number) => ({
      opacity: 0,
      y: -20,
      filter: 'blur(10px)',
      transition: {
        duration: 0.3,
        delay: index * 0.08,
        ease: [0.4, 0, 0.2, 1] as any,
      },
    }),
  }

  return (
    <section className="morecardcontainer">
      {!hideTitle && (
        <motion.h1
          initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as any }}
          className="mb-6 sm:mb-8 text-6xl sm:text-7xl md:text-7xl font-bold leading-tight tracking-tighter morecardh1"
        >
          tout.
        </motion.h1>
      )}
      {allSemesters.map((semesterYear) => (
        <motion.div
          key={semesterYear}
          className="mb-8 sm:mb-12"
          variants={containerVariants}
          initial={shouldAnimate ? 'hidden' : 'visible'}
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
                  viewport={{ once: true, margin: "0px", amount: 0.5 }}
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
    </section>
  )
}
