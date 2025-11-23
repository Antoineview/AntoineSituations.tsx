import type { Post, Settings } from 'lib/sanity.queries'
import Link from 'next/link'

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
    <div className="mb-7 mt-7">
      <h1 className="w-full font-normal tracking-tighter main-title block text-center md:text-left text-[clamp(3rem,min(12vw,6rem),6rem)] md:text-[clamp(2.5rem,min(12vw,7rem),7rem)]">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity font-['Crozet-Regular']"
        >
          {title}
        </Link>
      </h1>
      {lilparagraph && (
        <h1 className="mt-5 text-center text-base sm:text-lg md:text-left blog-subtitle">
          {lilparagraph}
        </h1>
      )}
      {bigparapraph && (
        <p className="mt-8 text-center text-base sm:text-lg md:text-left blog-description">
          {bigparapraph}
        </p>
      )}
    </div>
  )
}
