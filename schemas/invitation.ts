import { defineType } from 'sanity'
import { LinkIcon } from '@sanity/icons'
import InvitationGenerator from 'components/sanity/InvitationGenerator'

export default defineType({
  name: 'invitation',
  title: 'Invitation',
  icon: LinkIcon,
  type: 'document',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description:
        "A descriptive label for this invitation (e.g., 'Marketing Campaign 2024').",
    },
    {
      name: 'code',
      title: 'Invitation Code',
      type: 'string',
      readOnly: true,
      description: 'This code will be used to generate an invitation link.',
      components: {
        input: InvitationGenerator,
      },
    },
    {
      name: 'used',
      title: 'Used',
      type: 'boolean',
      readOnly: true,
      description:
        'Indicates if the invitation has been used to create a passkey.',
      initialValue: false,
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: 'code',
      used: 'used',
      createdAt: 'createdAt',
      label: 'label',
    },
    prepare({ title, used, createdAt, label }) {
      return {
        title: `Invitation ${title ? `(${title.slice(0, 8)}...)` : ''}`,
        subtitle: `${used ? 'Used' : 'Active'} - ${new Date(createdAt).toLocaleDateString()}${label ? ` - ${label}` : ''}`,
      }
    },
  },
})
