import { ImageIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'photoBlock',
    title: 'Photo',
    type: 'object',
    icon: ImageIcon,
    fields: [
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            fields: [
                {
                    name: 'alt',
                    title: 'Alternative Text',
                    type: 'string',
                    validation: (Rule) => Rule.required(),
                },
                {
                    name: 'caption',
                    title: 'Caption',
                    type: 'string',
                },
            ],
        }),
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Full Width', value: 'full' },
                    { title: 'Centered', value: 'centered' },
                ],
            },
            initialValue: 'full',
        }),
    ],
    preview: {
        select: {
            media: 'image',
            title: 'image.alt',
        },
        prepare({ media, title }) {
            return {
                title: title || 'Photo',
                media,
            }
        },
    },
})
