import { groq } from 'next-sanity'

const postFields = groq`
  _id,
  title,
  date,
  excerpt,
  file,
  coverImage,
  "slug": slug.current,
  "auteur": auteur->{name, picture},
`

export const settingsQuery = groq`*[_type == "settings"][0]{title,lilparagraph}`

export const indexQuery = groq`
*[_type == "post"] | order(date desc, _updatedAt desc) {
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

export interface auteur {
  name?: string
  picture?: any
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
}

export interface Settings {
  title?: string
  lilparagraph?: string
}
