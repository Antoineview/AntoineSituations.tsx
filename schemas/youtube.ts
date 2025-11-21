import { PlayIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

import { YouTubePreview } from './youtube/YouTubePreview'

export const youtube = defineType({
  name: 'youtube',
  type: 'object',
  title: 'YouTube Embed',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      title: 'YouTube video URL',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'Cover Image',
      description: 'Optional custom cover image for the video',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'url',
      coverImage: 'coverImage',
    },
    prepare({ title, coverImage }) {
      return { title, coverImage }
    },
  },
  components: {
    preview: YouTubePreview,
  },
})
