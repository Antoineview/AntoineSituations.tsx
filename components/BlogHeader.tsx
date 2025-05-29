import Link from 'next/link'
import type { Post, Settings } from 'lib/sanity.queries'

export default function BlogHeader({
  title,
  lilparagraph,
  bigparapraph,
}: {
  title: string
  lilparagraph?: string
  bigparapraph?: string
}) {
  return (
    <div className="mb-16 mt-16">
      <h1 className="w-full font-normal tracking-tighter main-title block px-0 text-[clamp(2.5rem,min(12vw,7rem),7rem)]">
        {title}
      </h1>
      {lilparagraph && (
        <h1 className="mt-5 text-center text-lg md:text-left blog-subtitle">
          {lilparagraph}
        </h1>
      )}
      {bigparapraph && (
        <p className="mt-8 text-center text-lg md:text-left blog-description">
          {bigparapraph}
        </p>
      )}
    </div>
  )
}
