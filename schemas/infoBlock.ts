import { InfoOutlineIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'infoBlock',
    title: 'Info Block',
    type: 'object',
    icon: InfoOutlineIcon,
    fields: [
        defineField({
            name: 'text',
            title: 'Text',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'level',
            title: 'Level',
            type: 'string',
            options: {
                list: [
                    { title: 'Info', value: 'info' },
                    { title: 'Warning', value: 'warning' },
                    { title: 'Error', value: 'error' },
                ],
                layout: 'radio',
            },
            initialValue: 'info',
        }),
    ],
    preview: {
        select: {
            title: 'text',
            subtitle: 'level',
        },
        prepare({ title, subtitle }) {
            return {
                title,
                subtitle: `[${subtitle?.toUpperCase()}]`,
                media: InfoOutlineIcon,
            }
        },
    },
})
