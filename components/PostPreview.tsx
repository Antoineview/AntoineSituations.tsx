import Avatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import type { Post } from 'lib/sanity.queries'
import Link from 'next/link'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  slug,
}: Omit<Post, '_id' | 'auteur'>) {
  return (
    <div>
      <div className="mb-5">
        <CoverImage
          slug={slug}
          title={title}
          image={coverImage}
          priority={false}
        />
      </div>
      <h1 className="mb-7 text-4xl leading-tight">
        <Link 
          href={`/posts/${slug}`} 
          className="hover:underline font-['Homoneta'] italic"
        >
          {title}
        </Link>
      </h1>
      <div className="mb-4 text-lg preview-date">
        <Date dateString={date} />
      </div>
      {excerpt && <p className="mb-4 text-lg leading-relaxed preview-excerpt">{excerpt}</p>}
    </div>
  )
}
