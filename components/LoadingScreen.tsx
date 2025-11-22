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

      // Hide text first
      tl.to(textRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
        // Expand keyhole by increasing its dimensions (not scale)
        .to(
          keyholeRef.current,
          {
            width: '6400px',
            height: '12800px',
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
      })

      // Animate in sequence
      tl.to(keyholeRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      }).to(
        textRef.current,
        {
          opacity: 1,
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
      {/* Large keyhole for expansion animation - rendered off-screen at full size */}
      <div
        ref={keyholeRef}
        onClick={handleKeyholeClick}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] cursor-pointer"
        style={{
          width: '64px',
          height: '128px',
          willChange: 'transform, opacity',
        }}
      >
        <svg
          viewBox="0 0 49 100"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{
            imageRendering: 'auto',
          }}
        >
          <path
            className="fill-black dark:fill-white transition-colors"
            d="M 48.318001 24.158997 C 48.318001 10.816002 37.502998 0 24.159 0 C 10.816 0 0 10.816002 0 24.158997 C 0 34.373001 6.349 43.089005 15.309 46.622002 L 1.282 100 L 21.209999 100 L 27.108 100 L 47.037998 100 L 33.011002 46.622002 C 41.971001 43.089005 48.318001 34.374001 48.318001 24.158997 Z"
          />
        </svg>
      </div>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
      >
      </div>
    </div>
  )
}
