import cn from 'classnames'
import { motion } from 'framer-motion'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect,useState } from 'react'

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

  const imageContent = source?.asset?._ref ? (
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
    />
  ) : generatedImageUrl ? (
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
    />
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
