import {defineArrayMember, defineType, defineField} from 'sanity'

export default defineType({
  name: 'pageBuilder',
  title: 'Page Builder',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
              }),
            ],
          },
        ],
      },
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
})
