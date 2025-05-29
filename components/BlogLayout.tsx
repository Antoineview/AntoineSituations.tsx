import AlertBanner from 'components/AlertBanner'
import BlogMeta from 'components/BlogMeta'
import Head from 'next/head'

export default function BlogLayout({
  preview,
  loading,
  children,
}: {
  preview: boolean
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <>
      <Head>
        <BlogMeta />
        <meta
          property="og:image"
          content="https://og-image.vercel.app/AdaptativeDesigns.png?theme=light&md=1&fontSize=150px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg"
          key="ogImage"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111827" media="(prefers-color-scheme: dark)" />
      </Head>
      <div className="min-h-screen relative bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-200 overflow-x-hidden">
        <AlertBanner preview={preview} loading={loading} />
        <main className="relative z-10 w-full max-w-[100vw]">{children}</main>
      </div>
    </>
  )
}
