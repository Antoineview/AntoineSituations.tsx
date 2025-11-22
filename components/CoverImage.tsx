
import cn from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

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
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const handleImageLoad = () => {
    setIsImageLoaded(true)
  }

  const imageContent = source?.asset?._ref ? (
    <motion.div
      initial={{ filter: 'blur(10px)', opacity: 1 }}
      animate={{
        filter: isImageLoaded || priority ? 'blur(0px)' : 'blur(10px)',
        opacity: 1,
      }}
      transition={{
        duration: priority ? 0 : 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Image
        className="h-auto w-full object-cover"
        style={{ borderRadius: '12px' }}
        width={1200}
        height={800}
        alt={`Cover Image for ${title}`}
        src={urlForImage(source)
          .height(800)
          .width(1200)
          .url()}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={urlForImage(source)
          .width(20)
          .height(10)
          .blur(10)
          .url()}
        onLoad={handleImageLoad}
      />
    </motion.div>
  ) : generatedImageUrl ? (
    <motion.div
      initial={{ filter: 'blur(10px)', opacity: 1 }}
      animate={{
        filter: isImageLoaded || priority ? 'blur(0px)' : 'blur(10px)',
        opacity: 1,
      }}
      transition={{
        duration: priority ? 0 : 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Image
        className="h-auto w-full object-cover"
        style={{ borderRadius: '12px' }}
        width={1200}
        height={800}
        alt={`Generated Cover Image for ${title}`}
        src={
          typeof generatedImageUrl === 'string'
            ? generatedImageUrl
            : urlForImage(generatedImageUrl)
              .height(800)
              .width(1200)
              .url()
        }
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder={typeof generatedImageUrl !== 'string' ? 'blur' : 'empty'}
        blurDataURL={
          typeof generatedImageUrl !== 'string'
            ? urlForImage(generatedImageUrl)
              .width(20)
              .height(10)
              .blur(10)
              .url()
            : undefined
        }
        onLoad={handleImageLoad}
      />
    </motion.div>
  ) : (
    <CoverImageGenerator
      onImageGenerated={(imageUrl) => setGeneratedImageUrl(imageUrl)}
      initialTitle={title}
      postId={postId}
    />
  )

  const wrapper = (
    <motion.div
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
