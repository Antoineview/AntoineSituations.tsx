/* eslint-disable @next/next/no-html-link-for-pages */
import Container from 'components/BlogContainer'

export default function Alert({
  preview,
  loading,
}: {
  preview?: boolean
  loading?: boolean
}) {
  if (!preview) return

  return (
    <div
      className="border-b text-white"
      style={{
        background: 'linear-gradient(90deg, var(--blob-color-1, #3b82f6), var(--blob-color-2, #8b5cf6), var(--blob-color-3, #ec4899), var(--blob-color-4, #f59e0b))',
        borderColor: 'rgba(255,255,255,0.18)',
        transition: 'background 0.5s'
      }}
    >
      <Container>
        <div className="py-2 text-center text-sm">
          {loading ? 'Loading... ' : 'This page is a preview. '}
          <a
            href="/api/exit-preview"
            className="underline transition-colors duration-200 hover:text-cyan"
          >
            Click here
          </a>{' '}
          to exit preview mode.
        </div>
      </Container>
    </div>
  )
}
