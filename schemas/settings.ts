import { CogIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Autre.',
  type: 'document',
  icon: CogIcon,
  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    {
      name: 'title',
      description: 'Titre du blog.',
      title: 'Titre',
      type: 'text',
      initialValue: 'Blog.',
      validation: (rule) => rule.required(),
    },
    {
      name: 'lilparagraph',
      description: 'Description.',
      title: 'Description.',
      type: 'text',
      rows: 5,
      initialValue: 'LOL',
      validation: (rule) => rule.required(),
    },
  ],
})
