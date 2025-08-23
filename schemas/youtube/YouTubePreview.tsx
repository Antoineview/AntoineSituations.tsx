import { Flex, Text } from '@sanity/ui'
import { urlForImage } from 'lib/sanity.image'
import Image from 'next/image'
import YouTubePlayer from 'react-player/youtube'
import type { Image as SanityImage } from 'sanity'
import type { PreviewProps } from 'sanity'

export function YouTubePreview(props: PreviewProps) {
  const { title: url, coverImage } = props as unknown as { title?: string; coverImage?: SanityImage }

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
