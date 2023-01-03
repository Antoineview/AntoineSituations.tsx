import { UserIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
  name: 'auteur',
  title: 'Auteur',
  icon: UserIcon,
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'picture',
      title: 'Picture',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
  ],
})
