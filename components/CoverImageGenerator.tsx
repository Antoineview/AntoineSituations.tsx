import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CoverImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void
  initialTitle?: string
  initialSubtitle?: string
}

const CoverImageGenerator = ({ 
  onImageGenerated, 
  initialTitle = '', 
  initialSubtitle = '' 
}: CoverImageGeneratorProps) => {
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [gradient, setGradient] = useState('linear-gradient(45deg, #ff6b6b, #4ecdc4)')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360)
    const saturation = 70 + Math.floor(Math.random() * 30)
    const lightness = 40 + Math.floor(Math.random() * 20)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const addGrain = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
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

  useEffect(() => {
    if (initialTitle || initialSubtitle) {
      generateImage()
    }
  }, [initialTitle, initialSubtitle])

  const getOptimalFontSize = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxHeight: number, minSize: number, maxSize: number) => {
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

  const generateImage = () => {
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
    const gradientObj = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
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

    // Calculate optimal font sizes
    const formattedTitle = title.replace(/\s+/g, '')
    const titleFontSize = getOptimalFontSize(ctx, formattedTitle, canvas.width * 6, canvas.height * 4, 32, 800)
    const subtitleFontSize = getOptimalFontSize(ctx, subtitle, canvas.width * 1.2, canvas.height * 1.2, 24, 600)

    // Title
    ctx.font = `${titleFontSize}px Crozet-Regular, serif`
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height * 0.4)
    ctx.rotate((Math.random() - 0.5) * Math.PI / 4) // Random rotation between -22.5 and 22.5 degrees
    ctx.fillText(formattedTitle, 0, 0)
    ctx.restore()

    // Subtitle
    ctx.font = `${subtitleFontSize}px Crozet-Regular, serif`
    ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.7)

    // Convert to image URL
    const imageUrl = canvas.toDataURL('image/png')
    if (onImageGenerated) {
      onImageGenerated(imageUrl)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Cover Image Generator</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter subtitle"
          />
        </div>
      </div>

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