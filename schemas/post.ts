import { BookIcon } from '@sanity/icons'
import { defineType, defineArrayMember } from 'sanity'
import CoverImageInput from './post/CoverImageInput'

import authorType from './author'
import { youtube } from './youtube'
import infoBlock from './infoBlock'
import divider from './divider'
import photoBlock from './photoBlock'

/**
 * This file is the schema definition for a post.
 *
 * Here you'll be able to edit the different fields that appear when you 
 * create or edit a post in the studio.
 * 
 * Here you can see the different schema types that are available:

  https://www.sanity.io/docs/schema-types

 */

export default defineType({
  name: 'post',
  title: 'Post',
  icon: BookIcon,
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'ID.',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'content',
      title: 'Contenu.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
        }),
        defineArrayMember({
          type: 'youtube',
        }),
        defineArrayMember({
          type: 'infoBlock',
        }),
        defineArrayMember({
          type: 'divider',
        }),
        defineArrayMember({
          type: 'photoBlock',
        }),
      ],
    },
    {
      name: 'excerpt',
      title: 'Extrait.',
      type: 'text',
    },
    {
      name: 'coverImage',
      title: 'Image.',
      type: 'image',
      options: {
        hotspot: true,
      },
      components: {
        input: CoverImageInput,
      },
    },
    {
      name: 'file',
      title: 'Fichier.',
      type: 'file',
    },
    {
      name: 'videoUrl',
      title: 'URL Vidéo',
      type: 'url',
      description: "URL d'une vidéo externe (YouTube, Vimeo, etc.)",
    },
    {
      name: 'date',
      title: 'Date.',
      type: 'datetime',
    },
    {
      name: 'auteur',
      title: 'Auteur.',
      type: 'reference',
      to: [{ type: authorType.name }],
    },
    {
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }],
    },
    {
      name: 'requiresAuth',
      title: 'Requiert une authentification',
      type: 'boolean',
      description:
        "Si coché, ce post ne sera accessible qu'après authentification",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'title',
      auteur: 'auteur.name',
      media: 'coverImage',
    },
    prepare(selection) {
      const { auteur } = selection
      return { ...selection, subtitle: auteur && `par ${auteur}` }
    },
  },
})
