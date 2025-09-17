/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { colorInput } from '@sanity/color-input'
import { dataset, projectId } from 'lib/sanity.api'
import { defineConfig } from 'sanity'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import authorType from 'schemas/author'
import categoryType from 'schemas/category'
import invitationType from 'schemas/invitation'
import postType from 'schemas/post'
import settingsType from 'schemas/settings'
import { youtube } from 'schemas/youtube'

const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'antoine.tsx'

export default defineConfig({
  // @TODO: update next-sanity/studio to automatically set this when needed
  basePath: '/studio',
  projectId,
  dataset,
  title,
  schema: {
    // If you want more content types, you can add them to this array
    types: [
      settingsType,
      postType,
      authorType,
      categoryType,
      youtube,
      invitationType,
    ],
  },
  plugins: [
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    // visionTool({ defaultApiVersion: apiVersion }),
    // Add color input plugin
    colorInput(),
  ],
})
