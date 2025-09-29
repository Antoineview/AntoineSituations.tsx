import 'styles/index.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { AnimationProvider } from '../components/AnimationContext'
import { ThemeProvider } from '../components/ThemeContext'
import LoadingScreen from '../components/LoadingScreen'

function MyApp({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const handleRouteChangeStart = () => {
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
        let attempts = 0
        const maxAttempts = 50

        // Use MutationObserver to wait for DOM changes
        const observer = new MutationObserver(() => {
          const currentMax =
            document.documentElement.scrollHeight - window.innerHeight
          const canScroll = currentMax >= targetPosition

          if (canScroll) {
            window.scrollTo(0, targetPosition)
            console.log(
              '✅ Scrolled to',
              targetPosition,
              'Current:',
              window.scrollY,
            )
          }
        })

        // Observe body for changes
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
        })

        // Aggressively restore scroll position
        const restore = () => {
          attempts++
          const currentMax =
            document.documentElement.scrollHeight - window.innerHeight
          const actualTarget = Math.min(targetPosition, currentMax)

          window.scrollTo(0, actualTarget)
          console.log(
            `🔄 Attempt ${attempts}: Target=${actualTarget}, Current=${window.scrollY}, Max=${currentMax}`,
          )

          if (attempts >= maxAttempts) {
            observer.disconnect()
            console.log('⚠️ Max attempts reached')
          }
        }

        // Try immediately and repeatedly
        restore()
        requestAnimationFrame(restore)

        const intervals = [
          1, 10, 50, 100, 150, 200, 300, 400, 500, 700, 1000, 1500, 2000,
        ]
        const timeouts = intervals.map((delay) => setTimeout(restore, delay))

        // Cleanup after 3 seconds
        setTimeout(() => {
          observer.disconnect()
          timeouts.forEach((t) => clearTimeout(t))
          console.log(
            '🏁 Scroll restoration complete. Final position:',
            window.scrollY,
          )
        }, 3000)
      } else {
        // New page, scroll to top
        window.scrollTo(0, 0)
        console.log('📄 New page, scrolled to top')
      }
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
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
        <Analytics />
        <SpeedInsights />
      </AnimationProvider>
    </ThemeProvider>
  )
}

export default MyApp
