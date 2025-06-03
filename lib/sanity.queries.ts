// lib/sanity.queries.ts
import { groq } from 'next-sanity'

const postFields = groq`
  _id,
  title,
  date,
  excerpt,
  file,
  coverImage,
  videoUrl,
  requiresAuth,
  "slug": slug.current,
  "auteur": auteur->{name, picture},
  "category": category->{title, "slug": slug.current, description, "color": color.hex}
`

export const settingsQuery = groq`*[_type == "settings"][0]{title,lilparagraph}`

export const indexQuery = groq`
*[_type == "post"] | order(date desc, _updatedAt desc) {
  ${postFields}
}`

export const categoriesQuery = groq`
*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  "color": color.hex
}`

export const postsByCategoryQuery = groq`
*[_type == "post" && category->slug.current == $categorySlug] | order(date desc, _updatedAt desc) {
  ${postFields}
}`

export const postQuery = groq`
{
  "post": *[_type == "post" && slug.current == $slug] | order(_updatedAt desc) [0] {
    content,
    ${postFields}
  },
  
  "morePosts": *[_type == "post" && slug.current != $slug] | order(date desc, _updatedAt desc) [0...2] {
    content,
    ${postFields}
  }
}`

export const postSlugsQuery = groq`
*[_type == "post" && defined(slug.current)][].slug.current
`

export const postBySlugQuery = groq`
*[_type == "post" && slug.current == $slug][0] {
  ${postFields}
}
`

export const fileQuery = groq`
*[_type == 'file'] {
  title,
  "file": file.asset->url
}
`

export interface auteur {
  name?: string
  picture?: any
}

export interface Category {
  _id: string
  title?: string
  slug?: string
  description?: string
  color?: {
    hex: string
  }
}

export interface Post {
  _id: string
  title?: string
  coverImage?: any
  date?: string
  excerpt?: string
  auteur?: auteur
  slug?: string
  content?: any
  file?: any
  videoUrl?: string
  category?: Category
  requiresAuth?: boolean
}

export interface Settings {
  title?: string
  lilparagraph?: string
  bigparagraph?: string
}

export type Author = {
  name: string
}