import type { Category } from 'lib/sanity.queries'
import Link from 'next/link'

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <section className="morecardcontainer">
      <h2 className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl morecardh1">
        catégories.
      </h2>
      <div className="mb-6 grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-5 md:gap-y-5 lg:gap-x-3">
        {categories.map((category) => (
          <div key={category._id} className="category-card">
            <Link href={`/categories/${category.slug}`} className="block group">
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
                {category.color?.hex && (
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color.hex }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold preview-title group-hover:underline">
                    {category.title}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-sm opacity-80 preview-excerpt">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}