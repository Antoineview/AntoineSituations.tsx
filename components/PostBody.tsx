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
import styles from './PostBody.module.css'

// Dynamically import ReactPlayer with no SSR
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

interface YouTubeNode {
  _type: 'youtube'
  url: string
}

const serializers = {
  types: {
    youtube: ({ value }: PortableTextTypeComponentProps<YouTubeNode>) => {
      if (!value?.url) return null
      
      return (
        <div className="relative w-full pt-[56.25%] mb-8">
          <div className="absolute top-0 left-0 w-full h-full">
            <ReactPlayer
              url={value.url}
              width="100%"
              height="100%"
              controls
              className="rounded-lg"
            />
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
