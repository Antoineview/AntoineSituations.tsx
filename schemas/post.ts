import { BookIcon } from '@sanity/icons'
import { defineType } from 'sanity'

import authorType from './author'

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
      of: [{ type: 'block' }],
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
    },
    {
      name: 'file',
      title: 'Fichier.',
      type: 'file',
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
