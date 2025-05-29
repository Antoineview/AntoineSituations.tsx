/**
 * This component uses Portable Text to render a post body.
 *
 * You can learn more about Portable Text on:
 * https://www.sanity.io/docs/block-content
 * https://github.com/portabletext/react-portabletext
 * https://portabletext.org/
 *
 */
import { PortableText } from '@portabletext/react'
import type { PortableTextTypeComponentProps } from '@portabletext/react'
import dynamic from 'next/dynamic'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import { useState } from 'react'
import styles from './PostBody.module.css'

// Dynamically import ReactPlayer with no SSR
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface YouTubeNode {
  _type: 'youtube'
  url: string
  coverImage?: {
    asset: {
      _ref: string
    }
  }
}

const serializers = {
  types: {
    youtube: ({ value }: PortableTextTypeComponentProps<YouTubeNode>) => {
      const [isPlaying, setIsPlaying] = useState(false)
      
      if (!value?.url) return null
      
      return (
        <div className="relative w-full pt-[56.25%] mb-8">
          <div className="absolute top-0 left-0 w-full h-full">
            {value.coverImage?.asset?._ref && !isPlaying ? (
              <div 
                className="relative w-full h-full cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <Image
                  src={urlForImage(value.coverImage).width(1280).height(720).url()}
                  alt="Video cover"
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-black" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <ReactPlayer
                url={value.url}
                width="100%"
                height="100%"
                controls
                playing={isPlaying}
                className="rounded-lg"
              />
            )}
          </div>
        </div>
      )
    }
  }
}

export default function PostBody({ content }) {
  return (
    <div className={`mx-auto max-w-2xl ${styles.portableText}`}>
      <PortableText value={content} components={serializers} />
    </div>
  )
}
