/**
 * This config is used to set up Sanity Studio that's mounted on the `/pages/studio/[[...index]].tsx` route
 */

import { apiVersion, dataset, previewSecretId, projectId } from 'lib/sanity.api'
import { previewDocumentNode } from 'plugins/previewPane'
import { productionUrl } from 'plugins/productionUrl'
import { settingsPlugin, settingsStructure } from 'plugins/settings'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { unsplashImageAsset } from 'sanity-plugin-asset-source-unsplash'
import { colorInput } from '@sanity/color-input'
import authorType from 'schemas/author'
import categoryType from 'schemas/category'
import postType from 'schemas/post'
import settingsType from 'schemas/settings'
import { youtube } from 'schemas/youtube'
import invitationType from 'schemas/invitation'

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
    deskTool({
      structure: settingsStructure(settingsType),
      // `defaultDocumentNode` is responsible for adding a "Preview" tab to the document pane
      defaultDocumentNode: previewDocumentNode({ apiVersion, previewSecretId }),
    }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    settingsPlugin({ type: settingsType.name }),
    // Add the "Open preview" action
    productionUrl({
      apiVersion,
      previewSecretId,
      types: [postType.name, settingsType.name],
    }),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    // visionTool({ defaultApiVersion: apiVersion }),
    // Add color input plugin
    colorInput(),
  ],
})
