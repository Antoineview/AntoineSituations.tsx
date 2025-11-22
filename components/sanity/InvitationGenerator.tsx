import { CopyIcon } from '@sanity/icons'
import { Button, Card, Stack, Text } from '@sanity/ui'
import { useState } from 'react'
import { set, useFormValue } from 'sanity'

interface InvitationGeneratorProps {
  value?: string
  onChange: (value: any) => void
}

export default function InvitationGenerator({
  value,
  onChange,
}: InvitationGeneratorProps) {
  const document: any = useFormValue([])

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)

  const handleGenerate = async () => {
    console.log('Attempting to generate invitation...')
    console.log('Document object:', document)

    if (!document?._id) {
      console.error('handleGenerate called without document._id', document)
      // This case is handled by conditional rendering, but good to log if somehow reached
      setError('Document not ready. Please save the document first.')
      return
    }

    console.log('Document ID found:', document._id)

    try {
      setIsGenerating(true)
      setError(null)

      console.log('Calling API with invitationId:', document._id)
      const response = await fetch('/api/auth/generate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId: document._id }),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(
          'API responded with an error:',
          response.status,
          errorBody,
        )
        throw new Error(
          `API error: ${response.status} ${response.statusText} - ${errorBody}`,
        )
      }

      const { invitationLink } = await response.json()
      console.log('API call successful, received link:', invitationLink)

      setInvitationLink(invitationLink)
      // Sanity expects the raw value for the field, not the full link
      const code = invitationLink.split('code=')[1]
      if (code) {
        onChange(set(code))
        console.log('Updated Sanity field with code:', code)
      } else {
        console.error(
          'Invalid invitation link format from API:',
          invitationLink,
        )
        throw new Error('Invalid invitation link received from API.')
      }
    } catch (err) {
      console.error('Error caught in handleGenerate:', err)
      // More detailed logging for the caught error
      if (err instanceof Error) {
        console.error(
          'Caught error is an Error instance:',
          err.message,
          err.stack,
        )
        setError(err.message)
      } else {
        console.error('Caught error is NOT an Error instance:', err)
        // Attempt to stringify or represent the non-Error value
        try {
          setError(JSON.stringify(err))
        } catch (stringifyErr) {
          console.error('Failed to stringify non-Error object:', stringifyErr)
          setError('An unknown error occurred.')
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink)
    }
  }

  const getInvitationLink = () => {
    if (invitationLink) return invitationLink
    // Construct the link using the value from the field if available
    if (value) return `https://antoines.app/register?code=${value}`
    return null
  }

  // Check if the document is available but new and unsaved (no _id yet)
  if (document && !document._id) {
    return (
      <Text size={1} muted>
        Save the document to generate an invitation code.
      </Text>
    )
  }

  // If document is completely missing (unexpected after saving, but handle defensively)
  if (!document) {
    return (
      <Text size={1} style={{ color: 'red' }}>
        Document information is missing (Please report this error if the
        document is saved)
      </Text>
    )
  }

  const currentLink = getInvitationLink()

  return (
    <Stack space={3}>
      {document.used ? (
        <Text>This invitation has already been used.</Text>
      ) : (
        <>
          {currentLink ? (
            <Card padding={3} radius={2} shadow={1}>
              <Stack space={2}>
                <Text>Invitation Link:</Text>
                <Text size={1} style={{ wordBreak: 'break-all' }}>
                  {currentLink}
                </Text>
                <Button
                  icon={CopyIcon}
                  text="Copy Link"
                  onClick={handleCopy}
                  mode="ghost"
                />
              </Stack>
            </Card>
          ) : (
            <Button
              text={isGenerating ? 'Generating...' : 'Generate Invitation'}
              onClick={handleGenerate}
              disabled={isGenerating || !document._id}
              tone="primary"
            />
          )}
          {error && (
            <Text size={1} style={{ color: 'red' }}>
              {error}
            </Text>
          )}
        </>
      )}
    </Stack>
  )
}
