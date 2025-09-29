import cn from 'classnames'
import { motion, AnimatePresence } from 'framer-motion'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

import CoverImageGenerator from './CoverImageGenerator'

interface CoverImageProps {
  title: string
  slug?: string
  image: any
  priority?: boolean
  description?: string
  postId?: string
}

const CoverImage = (props: CoverImageProps) => {
  const { title, slug, image: source, priority, description, postId } = props
  const [generatedImageUrl, setGeneratedImageUrl] = useState<
    string | { _type: string; asset: { _type: string; _ref: string } } | null
  >(null)
  const [shouldLoad, setShouldLoad] = useState(priority || false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading images
  useEffect(() => {
    if (priority || shouldLoad) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            observer.disconnect()
          }
        })
      },
      {
        root: null,
        rootMargin: '300px', // Start loading 300px before image enters viewport
        threshold: 0.01,
      },
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority, shouldLoad])

  const handleImageLoad = () => {
    setIsImageLoaded(true)
  }

  const imageContent = !shouldLoad ? (
    <div
      className="h-auto w-full object-cover bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
      style={{
        borderRadius: '12px',
        aspectRatio: '2/1',
        minHeight: '250px',
        filter: 'blur(10px)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  ) : source?.asset?._ref ? (
    <motion.div
      initial={
        priority
          ? { filter: 'blur(0px)', opacity: 1 }
          : { filter: 'blur(20px)', opacity: 0 }
      }
      animate={{
        filter: isImageLoaded || priority ? 'blur(0px)' : 'blur(20px)',
        opacity: isImageLoaded || priority ? 1 : 0.5,
      }}
      transition={{
        duration: priority ? 0 : 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Image
        className="h-auto w-full object-cover"
        style={{ borderRadius: '12px' }}
        width={2000}
        height={1000}
        alt={`Cover Image for ${title}`}
        src={urlForImage(source)
          .height(1000)
          .width(2000)
          .auto('format')
          .quality(75)
          .url()}
        sizes="100vw"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleImageLoad}
      />
    </motion.div>
  ) : generatedImageUrl ? (
    <motion.div
      initial={
        priority
          ? { filter: 'blur(0px)', opacity: 1 }
          : { filter: 'blur(20px)', opacity: 0 }
      }
      animate={{
        filter: isImageLoaded || priority ? 'blur(0px)' : 'blur(20px)',
        opacity: isImageLoaded || priority ? 1 : 0.5,
      }}
      transition={{
        duration: priority ? 0 : 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Image
        className="h-auto w-full object-cover"
        style={{ borderRadius: '12px' }}
        width={2000}
        height={1000}
        alt={`Generated Cover Image for ${title}`}
        src={
          typeof generatedImageUrl === 'string'
            ? generatedImageUrl
            : urlForImage(generatedImageUrl)
                .height(1000)
                .width(2000)
                .auto('format')
                .quality(75)
                .url()
        }
        sizes="100vw"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleImageLoad}
      />
    </motion.div>
  ) : shouldLoad ? (
    <CoverImageGenerator
      onImageGenerated={(imageUrl) => setGeneratedImageUrl(imageUrl)}
      initialTitle={title}
      postId={postId}
    />
  ) : (
    <div
      className="h-auto w-full object-cover bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800"
      style={{
        borderRadius: '12px',
        aspectRatio: '2/1',
        minHeight: '250px',
        filter: 'blur(10px)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }}
    />
  )

  const wrapper = (
    <motion.div
      ref={imageRef}
      style={{ borderRadius: '12px' }}
      whileHover={{
        scale: 1.009,
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
      }}
      transition={{
        duration: 0.4,
        ease: 'easeInOut',
        boxShadow: {
          duration: 0.3,
          ease: 'easeOut',
        },
      }}
    >
      {imageContent}
    </motion.div>
  )

  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title}>
          {wrapper}
        </Link>
      ) : (
        wrapper
      )}
    </div>
  )
}

export default CoverImage
