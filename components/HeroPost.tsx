import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import VideoPlayer from 'components/VideoPlayer'
import type { Post } from 'lib/sanity.queries'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HeroPost(
  props: Pick<
    Post,
    'title' | 'coverImage' | 'date' | 'excerpt' | 'slug' | 'videoUrl'
  >,
) {
  const { title, coverImage, date, excerpt, slug, videoUrl } = props

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
    <motion.section 
      className="herocard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        variants={itemVariants}
        className="mb-2 ml-1 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tighter hero-date"
      >
        <Date dateString={date} />
      </motion.h1>
      <motion.div 
        variants={itemVariants}
        className="heropostimage mb-6 sm:mb-8"
      >
        {videoUrl ? (
          <VideoPlayer url={videoUrl} title={title} />
        ) : (
          <CoverImage slug={slug} title={title} image={coverImage} priority />
        )}
      </motion.div>
      <motion.div 
        variants={itemVariants}
        className=""
      >
        <div>
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter heroposttext mb-4 sm:mb-6"
          >
            <Link href={`/posts/${slug}`} className="hover:underline font-semibold">
              {title || 'Untitled'}
            </Link>
          </motion.h1>
        </div>
        <div>
          {excerpt && (
            <motion.p 
              variants={itemVariants}
              className="mb-4 text-base sm:text-lg leading-relaxed hero-excerpt"
            >
              {excerpt}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.section>
  )
}
