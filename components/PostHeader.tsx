import Avatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import PostTitle from 'components/PostTitle'
import VideoPlayer from 'components/VideoPlayer'
import type { Post } from 'lib/sanity.queries'
import Link from 'next/link'

export default function PostHeader(
  props: Pick<Post, 'title' | 'coverImage' | 'file' | 'date' | 'auteur' | 'slug' | 'category' | 'videoUrl'>
) {
  const { title, coverImage, file, date, auteur, slug, category, videoUrl } = props

  console.log('PostHeader received props:', {
    title,
    videoUrl,
    slug,
    hasCoverImage: !!coverImage,
    hasFile: !!file
  })

  const handleDownload = () => {
    window.open(`${file}?dl=`, '_blank')
  }

  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:mb-12 md:block">
        {auteur && <Avatar name={auteur.name} picture={auteur.picture} />}
      </div>
      <div className="mb-8 sm:mx-0 md:mb-16">
        {videoUrl ? (
          <VideoPlayer url={videoUrl} title={title} />
        ) : (
          <CoverImage title={title} image={coverImage} priority slug={slug} />
        )}
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 block md:hidden">
          {auteur && <Avatar name={auteur.name} picture={auteur.picture} />}
        </div>
        <div className="mb-6 flex items-center gap-4 text-lg">
          <Date dateString={date} />
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors hover:bg-gray-100"
              style={{ color: category.color }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.title}
            </Link>
          )}
        </div>
        {file && (
          <div className="mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleDownload}
            >
              Download File
            </button>
          </div>
        )}
      </div>
    </>
  )
}
