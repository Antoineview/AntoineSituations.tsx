import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface AnimationContextType {
  shouldAnimate: boolean
  markAnimated: () => void
}

const AnimationContext = createContext<AnimationContextType>({
  shouldAnimate: true,
  markAnimated: () => {},
})

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [shouldAnimate, setShouldAnimate] = useState(() => {
    // Check if this is a back navigation
    if (typeof window !== 'undefined') {
      const isBackNavigation = sessionStorage.getItem('isBackNavigation')
      if (isBackNavigation === 'true') {
        return false
      }
      // Check if we've already animated in this session
      const hasAnimated = sessionStorage.getItem('hasAnimatedHome')
      return hasAnimated !== 'true'
    }
    return true
  })
  const router = useRouter()

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Mark if we're potentially doing back navigation
      if (url === '/' || url.startsWith('/categories/')) {
        const scrollPos = sessionStorage.getItem(`scroll_${url}`)
        // Only mark as back navigation if there's a significant scroll position
        if (scrollPos && parseInt(scrollPos) > 100) {
          sessionStorage.setItem('isBackNavigation', 'true')
        }
      }
    }

    const handleRouteChangeComplete = (url: string) => {
      // Check if this is back navigation
      const isBack = sessionStorage.getItem('isBackNavigation') === 'true'

      if (url === '/') {
        if (isBack) {
          setShouldAnimate(false)
          // Clean up after a short delay to ensure scroll restoration completes
          setTimeout(() => {
            sessionStorage.removeItem('isBackNavigation')
          }, 100)
        } else {
          // Fresh navigation to home
          const hasAnimated = sessionStorage.getItem('hasAnimatedHome')
          setShouldAnimate(hasAnimated !== 'true')
        }
      } else if (url.startsWith('/categories/')) {
        if (isBack) {
          setShouldAnimate(false)
          setTimeout(() => {
            sessionStorage.removeItem('isBackNavigation')
          }, 100)
        } else {
          setShouldAnimate(false)
        }
      } else {
        setShouldAnimate(false)
        // Clean up back navigation flag for other routes
        sessionStorage.removeItem('isBackNavigation')
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])

  const markAnimated = () => {
    if (router.pathname === '/') {
      sessionStorage.setItem('hasAnimatedHome', 'true')
    }
    setShouldAnimate(false)
  }

  return (
    <AnimationContext.Provider value={{ shouldAnimate, markAnimated }}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  return useContext(AnimationContext)
}
