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
          content="https://adaptativedesigns.vercel.app"
          key="ogImage"
        />
      </Head>
      <div className="min-h-screen">
        <AlertBanner preview={preview} loading={loading} />
        <main>{children}</main>
      </div>
    </>
  )
}
