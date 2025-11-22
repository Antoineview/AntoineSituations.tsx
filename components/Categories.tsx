import { AnimatePresence, motion } from 'framer-motion'
import type { Category } from 'lib/sanity.queries'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'

import { useAnimation } from './AnimationContext'

export default function Categories({ categories }: { categories: Category[] }) {
  const { shouldAnimate, markAnimated } = useAnimation()

  useEffect(() => {
    if (shouldAnimate) {
      markAnimated()
    }
  }, [shouldAnimate, markAnimated])

  // Cache the sorted categories
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.title.localeCompare(b.title)),
    [categories],
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.6, -0.05, 0.01, 0.99] as any,
      },
    }),
    exit: (index: number) => ({
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.6, -0.05, 0.01, 0.99] as any,
      },
    }),
  }

  return (
    <section className="morecardcontainer">
      <motion.h1
        initial={shouldAnimate ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] as any }}
        className="mb-8 text-6xl font-bold leading-tight tracking-tighter md:text-7xl morecardh1"
      >
        catégories.
      </motion.h1>
      <motion.div
        className="mb-6 grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-5 md:gap-y-5 lg:gap-x-3"
        variants={containerVariants}
        initial={shouldAnimate ? 'hidden' : 'visible'}
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {sortedCategories.map((category, index) => (
            <motion.div
              key={category._id}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px", amount: 0.5 }}
              exit="exit"
              layout
            >
              <Link
                href={`/categories/${category.slug}`}
                className="block group"
              >
                <div
                  className="flex items-center space-x-3 p-4 rounded-lg border border-white/20 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: category.color?.hex
                      ? `linear-gradient(135deg, transparent 0%, ${category.color.hex}30 50%, ${category.color.hex}40 100%)`
                      : 'transparent',
                  }}
                >
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
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
