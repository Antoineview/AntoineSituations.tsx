import 'styles/index.css'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Head from 'next/head'

import { ThemeProvider } from '../components/ThemeContext'
import LoadingScreen from '../components/LoadingScreen'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  )
}

export default MyApp
