import type { PreviewProps } from 'sanity'
import { Flex, Text } from '@sanity/ui'
import YouTubePlayer from 'react-player/youtube'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'

export function YouTubePreview(props: PreviewProps) {
  const { title: url, media: coverImage } = props

  return (
    <Flex padding={3} align="center" justify="center">
      {typeof url === 'string' ? (
        <div className="relative w-full aspect-video">
          {coverImage?.asset?._ref ? (
            <Image
              src={urlForImage(coverImage).width(400).height(225).url()}
              alt="Video cover"
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <YouTubePlayer url={url} width="100%" height="100%" />
          )}
        </div>
      ) : (
        <Text>Add a YouTube URL</Text>
      )}
    </Flex>
  )
}
