import type {PreviewProps} from 'sanity'
import {Flex, Text} from '@sanity/ui'
import YouTubePlayer from 'react-player/youtube'

export function YouTubePreview(props: PreviewProps) {
  const {title: url} = props

  return (
    <Flex padding={3} align="center" justify="center">
      {typeof url === 'string' 
        ? <YouTubePlayer url={url} width="100%" height="200px" /> 
        : <Text>Add a YouTube URL</Text>}
    </Flex>
  )
} 