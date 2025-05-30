import cn from 'classnames'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface CoverImageProps {
  title: string
  slug?: string
  image: any
  priority?: boolean
}

const CoverImage = (props: CoverImageProps) => {
  const { title, slug, image: source, priority } = props
  
  const imageContent = source?.asset?._ref ? (
    <Image
      className="h-auto w-full object-cover"
      style={{ borderRadius: '12px' }}
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={urlForImage(source).height(1000).width(2000).url()}
      sizes="100vw"
      priority={priority}
    />
  ) : (
    <div className="w-full aspect-[2/1] bg-gray-100" style={{ borderRadius: '12px' }} />
  )

  const wrapper = (
    <motion.div
      className="shadow-small"
      style={{ borderRadius: '12px' }}
      whileHover={{ scale: 1.009 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
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
