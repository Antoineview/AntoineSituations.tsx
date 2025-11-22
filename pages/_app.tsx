import 'styles/index.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

import { AnimationProvider } from '../components/AnimationContext'
import LoadingScreen from '../components/LoadingScreen'
import { ThemeProvider } from '../components/ThemeContext'
import { VisualEditing } from '@sanity/visual-editing/next-pages-router'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const scrollTimeoutRef = useRef<NodeJS.Timeout[]>([])
  const observerRef = useRef<MutationObserver | null>(null)
  const isRestoringRef = useRef(false)

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const handleRouteChangeStart = () => {
      // Cleanup any ongoing scroll restoration
      isRestoringRef.current = false
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      scrollTimeoutRef.current.forEach((t) => clearTimeout(t))
      scrollTimeoutRef.current = []

      // Save current scroll position
      const currentPos = window.scrollY
      sessionStorage.setItem(`scroll_${router.asPath}`, currentPos.toString())
      console.log('💾 Saved scroll for', router.asPath, ':', currentPos)
    }

    const handleRouteChangeComplete = (url: string) => {
      // Get saved position for this URL
      const savedPosition = sessionStorage.getItem(`scroll_${url}`)
      console.log('📍 Route complete:', url, 'Saved position:', savedPosition)

      if (savedPosition && parseInt(savedPosition) > 0) {
        const targetPosition = parseInt(savedPosition)
        isRestoringRef.current = true
        let restoredSuccessfully = false

        // Use MutationObserver to wait for DOM changes
        observerRef.current = new MutationObserver(() => {
          if (!isRestoringRef.current) return

          const currentMax =
            document.documentElement.scrollHeight - window.innerHeight
          const canScroll = currentMax >= targetPosition * 0.95 // Allow 5% tolerance

          if (canScroll && !restoredSuccessfully) {
            const actualTarget = Math.min(targetPosition, currentMax)
            window.scrollTo(0, actualTarget)

            // Check if scroll was successful
            requestAnimationFrame(() => {
              if (Math.abs(window.scrollY - actualTarget) < 10) {
                restoredSuccessfully = true
                console.log('✅ Scroll restored to', window.scrollY)

                // Cleanup after successful restoration
                setTimeout(() => {
                  if (observerRef.current) {
                    observerRef.current.disconnect()
                    observerRef.current = null
                  }
                  isRestoringRef.current = false
                }, 100)
              }
            })
          }
        })

        // Observe body for changes
        observerRef.current.observe(document.body, {
          childList: true,
          subtree: true,
        })

        // Immediate restoration attempts
        const restore = () => {
          if (!isRestoringRef.current || restoredSuccessfully) return

          const currentMax =
            document.documentElement.scrollHeight - window.innerHeight
          const actualTarget = Math.min(targetPosition, currentMax)

          // Only scroll if we're not already at the right position
          if (Math.abs(window.scrollY - actualTarget) > 5) {
            window.scrollTo(0, actualTarget)
          }
        }

        // Try immediately
        requestAnimationFrame(() => {
          restore()
          requestAnimationFrame(restore)
        })

        // Progressive restoration with increasing delays
        const delays = [50, 100, 200, 400, 800, 1200]
        scrollTimeoutRef.current = delays.map((delay) =>
          setTimeout(() => {
            restore()
          }, delay),
        )

        // Final cleanup after 2 seconds
        scrollTimeoutRef.current.push(
          setTimeout(() => {
            if (observerRef.current) {
              observerRef.current.disconnect()
              observerRef.current = null
            }
            isRestoringRef.current = false
            console.log(
              '🏁 Scroll restoration complete. Final:',
              window.scrollY,
            )
          }, 2000),
        )
      } else {
        // New page, scroll to top
        window.scrollTo(0, 0)
        console.log('📄 New page, scrolled to top')
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      // Cleanup on unmount
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      scrollTimeoutRef.current.forEach((t) => clearTimeout(t))
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])

  return (
    <ThemeProvider>
      <AnimationProvider>
        <LoadingScreen />
        <Head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <meta
            name="theme-color"
            content="#ffffff"
            media="(prefers-color-scheme: light)"
          />
          <meta
            name="theme-color"
            content="#111827"
            media="(prefers-color-scheme: dark)"
          />
          <meta name="description" content="Blog de Antoine RC." />
          <meta name="author" content="Antoine RICHARD-CAPPONI" />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Antoine Situations" />
          <meta property="og:description" content="Blog de Antoine RC." />
          <meta
            property="og:image"
            content="https://cdn.sanity.io/images/y2ew53ag/production/af0b82efb73552c72c4dd8820b7cedd6e0c9ef6d-1200x630.png?w=2000&fit=max&auto=format&dpr=2"
          />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="AntoineView" />
          <meta name="twitter:description" content="Blog de Antoine RC." />
          <meta
            name="twitter:image"
            content="https://cdn.sanity.io/images/y2ew53ag/production/af0b82efb73552c72c4dd8820b7cedd6e0c9ef6d-1200x630.png?w=2000&fit=max&auto=format&dpr=2"
          />

          {/* PWA */}
          <link rel="manifest" href="/manifest.json" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon/favicon-16x16.png"
          />
          <link rel="shortcut icon" href="/favicon/favicon.ico" />

          <title>AntoineView</title>
        </Head>
        <Component {...pageProps} />
        {pageProps.preview && <VisualEditing />}
        <Analytics />
        <SpeedInsights />
      </AnimationProvider>
    </ThemeProvider>
  )
}

export default MyApp
