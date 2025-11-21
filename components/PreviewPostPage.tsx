import PostPage from 'components/PostPage'

export default function PreviewPostPage({
  data,
  settings,
}: {
  data: any
  settings: any
}) {
  return <PostPage preview data={data} settings={settings} />
}
