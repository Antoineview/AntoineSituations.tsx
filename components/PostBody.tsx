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
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import React, { ReactNode } from 'react'

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

const textVariants = {
  hidden: { 
    opacity: 0,
    y: 50
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  }
}

const AnimatedText = ({ children, as: Component = 'p' }: { children: ReactNode, as?: keyof JSX.IntrinsicElements }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  
  // Convert React children to string
  const textContent = React.Children.map(children, child => {
    if (typeof child === 'string') return child
    if (React.isValidElement(child)) {
      return child.props.children
    }
    return ''
  }).join('')

  const lines = textContent.split('\n').filter(line => line.trim() !== '')
  
  return (
    <Component ref={ref} className={styles.portableText}>
      {lines.map((line, index) => (
        <motion.span
          key={index}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={textVariants}
          className="block"
          custom={index}
          transition={{
            delay: index * 0.1
          }}
        >
          {line}
        </motion.span>
      ))}
    </Component>
  )
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
      <PortableText 
        value={content} 
        components={{
          ...serializers,
          marks: {
            strong: ({ children }) => <strong>{children}</strong>,
            em: ({ children }) => <em>{children}</em>,
            code: ({ children }) => <code>{children}</code>,
            link: ({ children, value }) => {
              const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
              return (
                <a
                  href={value?.href}
                  target={target}
                  rel={target === '_blank' ? 'noindex nofollow' : undefined}
                >
                  {children}
                </a>
              )
            }
          },
          block: {
            normal: ({ children }) => (
              <AnimatedText as="p">{children}</AnimatedText>
            ),
            h2: ({ children }) => (
              <AnimatedText as="h2">{children}</AnimatedText>
            ),
            h3: ({ children }) => (
              <AnimatedText as="h3">{children}</AnimatedText>
            )
          }
        }} 
      />
    </div>
  )
}
