import IndexPage from 'components/IndexPage'
import { usePreview } from 'lib/sanity.preview'
import {
  categoriesQuery,
  type Category,
  indexQuery,
  type Post,
  type Settings,
  settingsQuery,
} from 'lib/sanity.queries'

export default function PreviewIndexPage({ token }: { token: null | string }) {
  const posts: Post[] = usePreview(token, indexQuery) || []
  const settings: Settings = usePreview(token, settingsQuery) || {}
  const categories: Category[] = usePreview(token, categoriesQuery) || []

  return (
    <IndexPage
      preview
      posts={posts}
      settings={settings}
      categories={categories}
    />
  )
}
