import { DocumentIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
    name: 'page',
    title: 'Page',
    type: 'document',
    icon: DocumentIcon,
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'pageBuilder',
            title: 'Page Builder',
            type: 'array',
            of: [
                defineArrayMember({
                    type: 'block',
                    // Only allow basic text styles for simplicity, or customize as needed
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'Quote', value: 'blockquote' },
                    ],
                    lists: [{ title: 'Bullet', value: 'bullet' }],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                        ],
                    },
                }),
                defineArrayMember({
                    type: 'photoBlock',
                }),
                defineArrayMember({
                    type: 'youtube', // reusing existing youtube schema
                }),
                defineArrayMember({
                    type: 'divider',
                }),
                defineArrayMember({
                    type: 'infoBlock',
                }),
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            slug: 'slug.current',
        },
        prepare({ title, slug }) {
            return {
                title,
                subtitle: slug ? `/${slug}` : 'No slug',
            }
        },
    },
})
