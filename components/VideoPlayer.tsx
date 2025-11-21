import { motion } from 'framer-motion'
import { useEffect, useRef,useState } from 'react'

interface VideoPlayerProps {
  url: string
  title: string
  priority?: boolean
}

export default function VideoPlayer({
  url,
  title,
  priority = false,
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [shouldLoad, setShouldLoad] = useState(priority)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading videos
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
        rootMargin: '300px', // Start loading 300px before video enters viewport
        threshold: 0.01,
      },
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [priority, shouldLoad])

  useEffect(() => {
    if (!url) {
      setError('No URL provided')
      return
    }

    try {
      // Handle YouTube URLs
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId: string | undefined

        if (url.includes('youtube.com')) {
          const urlObj = new URL(url)
          videoId = urlObj.searchParams.get('v') || undefined
        } else if (url.includes('youtu.be')) {
          videoId = url.split('youtu.be/')[1]?.split('?')[0]
        }

        if (videoId) {
          setEmbedUrl(`https://www.youtube.com/embed/${videoId}`)
          setError('')
        } else {
          setError('Invalid YouTube URL')
        }
      }
      // Handle Vimeo URLs
      else if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
        if (videoId) {
          setEmbedUrl(`https://player.vimeo.com/video/${videoId}`)
          setError('')
        } else {
          setError('Invalid Vimeo URL')
        }
      } else {
        setError('Unsupported video platform')
      }
    } catch (err) {
      setError('Invalid URL format')
    }
  }, [url])

  const handleIframeLoad = () => {
    setIsVideoLoaded(true)
  }

  if (error) {
    return (
      <div className="w-full p-4 mb-8 text-center text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  if (!embedUrl) return null

  return (
    <div ref={videoRef} className="relative w-full pt-[56.25%] mb-8">
      {shouldLoad ? (
        <>
          {!isVideoLoaded && (
            <div
              className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
              style={{
                filter: 'blur(10px)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              <div className="text-gray-400 dark:text-gray-500">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
            </div>
          )}
          <motion.iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={handleIframeLoad}
            initial={
              priority
                ? { filter: 'blur(0px)', opacity: 1 }
                : { filter: 'blur(20px)', opacity: 0 }
            }
            animate={{
              filter: isVideoLoaded || priority ? 'blur(0px)' : 'blur(20px)',
              opacity: isVideoLoaded || priority ? 1 : 0,
            }}
            transition={{
              duration: priority ? 0 : 0.7,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          />
        </>
      ) : (
        <div
          className="absolute top-0 left-0 w-full h-full rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
          style={{
            filter: 'blur(10px)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        >
          <div className="text-gray-400 dark:text-gray-500">
            <svg
              className="w-16 h-16"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
