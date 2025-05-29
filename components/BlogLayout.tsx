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
      </Head>
      <div className="min-h-screen relative">
        <AlertBanner preview={preview} loading={loading} />
        <main className="relative z-10">{children}</main>
      </div>
    </>
  )
}
