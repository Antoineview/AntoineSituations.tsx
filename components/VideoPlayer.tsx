import { useEffect, useState } from 'react'

interface VideoPlayerProps {
  url: string
  title: string
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('')
  const [error, setError] = useState<string>('')

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

  if (error) {
    return (
      <div className="w-full p-4 mb-8 text-center text-red-500 bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  if (!embedUrl) return null

  return (
    <div className="relative w-full pt-[56.25%] mb-8">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
