import { motion } from 'framer-motion'
import { apiVersion,dataset, projectId } from 'lib/sanity.api'
import { createClient } from 'next-sanity'
import { useCallback,useEffect, useRef } from 'react'

interface CoverImageGeneratorProps {
  onImageGenerated?: (
    imageUrl:
      | string
      | { _type: string; asset: { _type: string; _ref: string } },
  ) => void
  initialTitle?: string
  postId?: string
}

const CoverImageGenerator = ({
  onImageGenerated,
  initialTitle = '',
  postId = '',
}: CoverImageGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 70 + Math.floor(Math.random() * 30)
    const lightness = 40 + Math.floor(Math.random() * 20)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const addGrain = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 50 - 25
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
    }

    ctx.putImageData(imageData, 0, 0)
  }


  const getOptimalFontSize = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    maxHeight: number,
    minSize: number,
    maxSize: number,
  ) => {
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

  const uploadImageToSanity = useCallback(async (imageDataUrl: string) => {
    try {
      const client = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
      })

      // Convert base64 to blob
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()

      // Create a file object
      const file = new File([blob], `${postId || 'generated'}-cover.png`, {
        type: 'image/png',
      })

      // Upload to Sanity
      const result = await client.assets.upload('image', file, {
        filename: `${postId || 'generated'}-cover.png`,
      })

      // Create a proper Sanity image reference
      const imageReference = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: result._id,
        },
      }

      return imageReference
    } catch (error) {
      console.error('Error uploading image to Sanity:', error)
      return null
    }
  }, [postId])

  const generateImage = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 1200
    canvas.height = 630

    // Generate random gradient colors
    const color1 = getRandomColor()
    const color2 = getRandomColor()

    // Draw gradient background
    const gradientObj = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    )
    gradientObj.addColorStop(0, color1)
    gradientObj.addColorStop(1, color2)
    ctx.fillStyle = gradientObj
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add grain effect
    addGrain(ctx, canvas.width, canvas.height)

    // Add text
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Calculate optimal font size for title
    const formattedTitle = initialTitle.replace(/\s+/g, '')
    const titleFontSize = getOptimalFontSize(
      ctx,
      formattedTitle,
      canvas.width * 10,
      canvas.height * 8,
      32,
      2000,
    )

    // Title
    ctx.font = `${titleFontSize}px Crozet-Regular, serif`
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height * 0.6)
    ctx.rotate(((Math.random() - 0.5) * Math.PI) / 4) // Random rotation between -22.5 and 22.5 degrees
    ctx.fillText(formattedTitle, 0, 0)
    ctx.restore()

    // Convert to image URL
    const imageUrl = canvas.toDataURL('image/png')

    // Upload to Sanity if postId is provided
    if (postId) {
      const uploadedImage = await uploadImageToSanity(imageUrl)
      if (uploadedImage && onImageGenerated) {
        onImageGenerated(uploadedImage)
      }
    } else if (onImageGenerated) {
      onImageGenerated(imageUrl)
    }
  }, [initialTitle, postId, onImageGenerated, uploadImageToSanity])

  useEffect(() => {
    if (initialTitle) {
      generateImage()
    }
  }, [initialTitle, generateImage])

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generateImage}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Generate Image
      </motion.button>

      <div className="mt-6">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg shadow-md"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default CoverImageGenerator
