import { RemoveIcon } from '@sanity/icons'
import { defineType } from 'sanity'

export default defineType({
    name: 'divider',
    title: 'Divider',
    type: 'object',
    icon: RemoveIcon,
    fields: [
        {
            name: 'style',
            title: 'Style',
            type: 'string',
            options: {
                list: [
                    { title: 'Default', value: 'default' },
                    { title: 'Wide', value: 'wide' },
                ],
            },
            initialValue: 'default',
        },
    ],
    preview: {
        prepare() {
            return {
                title: 'Divider',
                media: RemoveIcon,
            }
        },
    },
})
