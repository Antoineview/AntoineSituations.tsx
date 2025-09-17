import { TagIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Catégorie',
  icon: TagIcon,
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
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'color',
      title: 'Couleur',
      type: 'color',
      options: {
        disableAlpha: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      description: 'description',
    },
    prepare(selection) {
      const { title, description } = selection
      return {
        title,
        subtitle: description || 'Aucune description',
      }
    },
  },
})
