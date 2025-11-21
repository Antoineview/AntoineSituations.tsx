import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'

export default function LoadingScreen() {
  const [isComplete, setIsComplete] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const keyholeRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleKeyholeClick = () => {
    if (isClicked) return
    setIsClicked(true)

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsComplete(true)
        },
      })

      // Zoom into keyhole effect
      tl.to(textRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
        .to(
          keyholeRef.current,
          {
            scale: 50,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          },
          '-=0.1',
        )
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.4,
            ease: 'power1.out',
          },
          '-=0.5',
        )
    }, loaderRef)

    return () => ctx.revert()
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // Initial state - everything hidden
      gsap.set([keyholeRef.current, textRef.current], {
        opacity: 0,
        y: 30,
      })

      // Animate in sequence
      tl.to(keyholeRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      }).to(
        textRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.4',
      )

      // Subtle breathing animation for keyhole
      gsap.to(keyholeRef.current, {
        scale: 1.05,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    }, loaderRef)

    return () => ctx.revert()
  }, [])

  if (isComplete) return null

  return (
    <div ref={loaderRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
      >
        <div className="text-center px-6">
          {/* Keyhole Container */}
          <div className="flex justify-center mb-8">
            <div
              ref={keyholeRef}
              onClick={handleKeyholeClick}
              className="relative w-16 h-32 cursor-pointer transition-transform hover:scale-110"
              style={{ willChange: 'transform' }}
            >
              {/* Keyhole SVG */}
              <svg
                width="49"
                height="100"
                viewBox="0 0 49 100"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  className="fill-black dark:fill-white transition-colors"
                  d="M 48.318001 24.158997 C 48.318001 10.816002 37.502998 0 24.159 0 C 10.816 0 0 10.816002 0 24.158997 C 0 34.373001 6.349 43.089005 15.309 46.622002 L 1.282 100 L 21.209999 100 L 27.108 100 L 47.037998 100 L 33.011002 46.622002 C 41.971001 43.089005 48.318001 34.374001 48.318001 24.158997 Z"
                />
              </svg>
            </div>
          </div>

          {/* Loading text with Poppins-Text */}
          <p
            ref={textRef}
            className="font-['Poppins-Text'] text-black dark:text-white text-sm tracking-wide opacity-70"
          >
            Click to enter...
          </p>
        </div>
      </div>
    </div>
  )
}
