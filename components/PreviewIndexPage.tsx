import IndexPage from 'components/IndexPage'

export default function PreviewIndexPage({
  posts,
  settings,
  categories,
}: {
  posts: any[]
  settings: any
  categories: any[]
}) {
  return (
    <IndexPage
      preview
      posts={posts}
      settings={settings}
      categories={categories}
    />
  )
}
