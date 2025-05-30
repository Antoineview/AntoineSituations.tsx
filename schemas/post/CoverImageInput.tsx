import { Box, Button, Stack } from '@sanity/ui'
import { ImageIcon } from '@sanity/icons'
import { useClient } from 'sanity'
import { useState, useEffect } from 'react'
import { set, unset, useFormValue } from 'sanity'
import { ImageInput, ImageInputProps } from 'sanity'

interface CoverImageInputProps extends ImageInputProps {
  elementProps: any
}

export default function CoverImageInput(props: CoverImageInputProps) {
  const { value, onChange } = props
  const [isGenerating, setIsGenerating] = useState(false)
  const client = useClient()
  
  // Get the document data using useFormValue
  const document = useFormValue([]) as any
  const title = document?.title

  // Add debug logging
  useEffect(() => {
    console.log('Document data:', document)
    console.log('Title field:', title)
  }, [document, title])

  const generateImage = async () => {
    try {
      setIsGenerating(true)
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Canvas operations can only be performed in the browser')
      }
      
      // Create a temporary canvas
      const canvas = window.document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size
      canvas.width = 1200
      canvas.height = 630

      // Generate random gradient colors
      const getRandomColor = () => {
        const hue = Math.floor(Math.random() * 360)
        const saturation = 15 + Math.floor(Math.random() * 10) // Much lower saturation range
        const lightness = 50 + Math.floor(Math.random() * 10) // Higher base lightness
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`
      }

      const color1 = getRandomColor()
      const color2 = getRandomColor()

      // Draw gradient background
      const gradientObj = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradientObj.addColorStop(0, color1)
      gradientObj.addColorStop(1, color2)
      ctx.fillStyle = gradientObj
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add grain effect
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 50 - 25
        data[i] = Math.max(0, Math.min(255, data[i] + noise))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
      }
      
      ctx.putImageData(imageData, 0, 0)

      // Add text
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Get optimal font size
      const getOptimalFontSize = (text: string, maxWidth: number, maxHeight: number, minSize: number, maxSize: number) => {
        let fontSize = maxSize
        ctx.font = `${fontSize}px Crozet-Regular, serif`
        
        while (fontSize > minSize) {
          const metrics = ctx.measureText(text)
          if (metrics.width <= maxWidth && fontSize <= maxHeight) {
            break
          }
          fontSize -= 1
          ctx.font = `${fontSize}px Crozet-Regular, serif`
        }
        
        return fontSize
      }

      // Get title from the document with better error handling
      if (!title) {
        console.error('No title found in document')
        throw new Error('No title found in document')
      }

      const formattedTitle = title.replace(/\s+/g, '')
      const titleFontSize = 2000

      // Draw title
      ctx.font = `${titleFontSize}px Crozet-Regular, serif`
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height * 0.5)
      ctx.rotate((Math.random() - 0.5) * Math.PI / 4) // Random rotation between -22.5 and 22.5 degrees
      ctx.fillText(formattedTitle, 0, 0)
      ctx.restore()

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/png')
      })

      // Create a file object
      const file = new File([blob], `${document?._id || 'generated'}-cover.png`, { type: 'image/png' })

      // Upload to Sanity
      const result = await client.assets.upload('image', file, {
        filename: `${document?._id || 'generated'}-cover.png`,
      })

      // Create a proper Sanity image reference
      const imageReference = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: result._id
        }
      }

      // Update the field
      onChange(set(imageReference))

      // Force publish the post
      if (document?._id) {
        await client.patch(document._id).set({ _id: document._id }).commit()
      }
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Check if we have access to the document data
  const hasDocumentAccess = Boolean(document)
  const hasTitle = Boolean(title)

  return (
    <Stack space={3}>
      <Box>
        <Button
          icon={ImageIcon}
          text={isGenerating ? 'Generating...' : 'Generate Cover Image'}
          onClick={generateImage}
          disabled={isGenerating || !hasTitle}
          tone="primary"
          style={{ marginBottom: '1rem' }}
        />
        {!hasDocumentAccess && (
          <div style={{ color: 'red', marginTop: '0.5rem' }}>
            No document access. Please save the post first.
          </div>
        )}
        {hasDocumentAccess && !hasTitle && (
          <div style={{ color: 'red', marginTop: '0.5rem' }}>
            Please add a title to the post first.
          </div>
        )}
      </Box>
      <ImageInput {...props} />
    </Stack>
  )
} 