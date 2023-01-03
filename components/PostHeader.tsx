import Avatar from 'components/AuthorAvatar'
import CoverImage from 'components/CoverImage'
import Date from 'components/PostDate'
import PostTitle from 'components/PostTitle'
import type { Post } from 'lib/sanity.queries'

export default function PostHeader(
  props: Pick<Post, 'title' | 'coverImage' | 'file' | 'date' | 'auteur' | 'slug'>
) {
  const { title, coverImage, file, date, auteur, slug } = props
  return (
    <>
      <PostTitle>{title}</PostTitle>
      <div className="hidden md:mb-12 md:block">
        {auteur && <Avatar name={auteur.name} picture={auteur.picture} />}
      </div>
      <div className="mb-8 sm:mx-0 md:mb-16">
        <CoverImage title={title} image={coverImage} priority slug={slug} />
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 block md:hidden">
          {auteur && <Avatar name={auteur.name} picture={auteur.picture} />}
        </div>
        <div className="mb-6 text-lg">
          <Date dateString={date} />
        </div>
      </div>
    </>
  )
}
