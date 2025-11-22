import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef(null)
  const keyholePathRef = useRef(null)
  const textRef = useRef(null)

  // This is the path provided, but standardizing it to a 100x100 viewBox
  // Original: M 0.98... (Normalized 0-1). 
  // We will scale it in the SVG transform.
  const keyholePathData = "M 0.98814 0.24159 C 0.98814 0.10816 0.76642 0 0.49411 0 C 0.22138 0 0 0.10816 0 0.24159 C 0 0.34373 0.12984 0.43089 0.31295 0.46622 L 0.02621 1 L 0.43381 1 L 0.55429 1 L 0.96233 1 L 0.67559 0.46622 C 0.85912 0.43089 0.98814 0.34374 0.98814 0.24159 Z"

  // Block scrolling until animation completes
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    // Responsive scale multiplier for mobile devices
    const isMobile = window.innerWidth < 768
    const scaleMultiplier = isMobile ? 2 : 1

    const ctx = gsap.context(() => {
      // Intro Animation
      gsap.set(textRef.current, { opacity: 0, y: 20 })
      gsap.set(keyholePathRef.current, { 
        transformOrigin: "center center",
        scale: 0 // Start completely closed
      })

      const tl = gsap.timeline()

      // 1. Open the hole slightly to reveal content
      tl.to(keyholePathRef.current, {
        scale: 0.5 * scaleMultiplier,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      })
      // 2. Show instruction text
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      }, "-=1.0")

      // 3. Idle breathing animation
      gsap.to(keyholePathRef.current, {
        scale: 0.55 * scaleMultiplier,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.5 // Wait for intro to finish
      })

    }, containerRef)

    return () => ctx.revert()
  }, [])

  const handleClick = () => {
    if (isClicked) return
    setIsClicked(true)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Restore scrolling before unmounting
          document.body.style.overflow = ''
          setIsComplete(true)
          if (onComplete) onComplete()
        }
      })

      // 1. Fade out text immediately
      tl.to(textRef.current, {
        opacity: 0,
        duration: 0.2
      })
      // 2. Expand the keyhole until it covers the screen
      // Increased scale here to ensure coverage with smaller starting size
      .to(keyholePathRef.current, {
        scale: 50, 
        duration: 1.5,
        ease: "power3.inOut",
      })
      
    }, containerRef)
  }

  if (isComplete) return null

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 cursor-pointer"
      onClick={handleClick}
    >
      {/* The SVG acts as the overlay. 
         - text-white sets the 'fill' for the overlay rect. 
         - 'mask' attribute applies our custom transparency.
      */}
      <svg 
        className="w-full h-full"
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid slice"
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        <defs>
          <mask id="keyhole-mask">
            {/* White pixel = Opaque (Visible Overlay) 
               Black pixel = Transparent (Hole showing content behind)
            */}
            <rect x="0" y="0" width="100" height="100" fill="white" />
            
            {/* The Keyhole Shape (Black = Hole) */}
            {/* We wrap the path in a group to handle positioning.
                Reduced scale to 10, 20 (half of previous) for smaller visual.
                Centered using translate(-5, -10).
            */}
            <g transform="translate(50, 50)">
               <g ref={keyholePathRef}>
                  <path 
                    d={keyholePathData} 
                    fill="black" 
                    transform="translate(-5, -10) scale(10, 20)"
                  />
               </g>
            </g>
          </mask>
        </defs>

        {/* The Actual Overlay using the mask */}
        <rect 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          className="fill-white dark:fill-gray-900"
          mask="url(#keyhole-mask)" 
        />
      </svg>
    </div>
  )
}
