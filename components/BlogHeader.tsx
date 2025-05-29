import Link from 'next/link'
import type { Post, Settings } from 'lib/sanity.queries'
import { ThemeToggle } from './ThemeToggle'

export default function BlogHeader({
  title,
  lilparagraph,
  bigparapraph,
}: {
  lilparagraph: string
  bigparapraph: string
  title: string
}) {
  return (
    <>
      <header className="mt-16 mb-10 flex flex-col items-center md:mb-12 md:flex-row md:justify-between">
        <h1 className="text-6xl font-bold leading-tight tracking-tighter md:pr-8 md:text-8xl main-title">
          {title}
        </h1>
        <div className="flex items-center gap-4">
          <h1 className="mt-5 text-center text-lg md:pl-8 md:text-left blog-subtitle">
            {lilparagraph}
          </h1>
          <ThemeToggle />
        </div>
      </header>
      <p className="mt-8 text-center text-lg md:text-left blog-description">
        {bigparapraph}
      </p>
    </>
  )
}
