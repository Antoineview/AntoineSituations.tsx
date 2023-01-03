import PostPreview from 'components/PostPreview'
import type { Post } from 'lib/sanity.queries'

export default function MoreStories({ posts }: { posts: Post[] }) {
  return (
    <section className="morecardcontainer">
      <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl morecardh1">
        plus.
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-y-1 md:grid-cols-2 md:gap-x-5 md:gap-y-5 lg:gap-x-3">
        {posts.map((post) => (
          <PostPreview
            key={post._id}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            auteur={post.auteur}
            slug={post.slug}
            excerpt={post.excerpt}
          />
        ))}
      </div>
    </section>
  )
}
