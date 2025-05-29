import AuthorAvatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import VideoPlayer from 'components/VideoPlayer'
import type { Post } from 'lib/sanity.queries'
import Link from 'next/link'

export default function HeroPost(
  props: Pick<
    Post,
    'title' | 'coverImage' | 'date' | 'excerpt' | 'auteur' | 'slug' | 'videoUrl'
  >,
) {
  const { title, coverImage, date, excerpt, auteur, slug, videoUrl } = props
  return (
    <section className="herocard">
      <h2 className="mb-2 ml-1 text-6xl font-bold leading-tight tracking-tighter md:text-7xl hero-date">
        <Date dateString={date} />
      </h2>
      <div className="heropostimage">
        {videoUrl ? (
          <VideoPlayer url={videoUrl} title={title} />
        ) : (
          <CoverImage slug={slug} title={title} image={coverImage} priority />
        )}
      </div>
      <div className="">
        <div>
          <h3 className="heroposttext">
            <Link href={`/posts/${slug}`} className="hover:underline">
              {title || 'Untitled'}
            </Link>
          </h3>
        </div>
        <div>
          {excerpt && <p className="mb-4 text-lg leading-relaxed hero-excerpt">{excerpt}</p>}
          {auteur && (
            <AuthorAvatar name={auteur.name} picture={auteur.picture} />
          )}
        </div>
      </div>
    </section>
  )
}
