import { Compass, Lightbulb, PlayCircle, BookOpen, Lock, LockOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { Heading, Title } from '@/components/ui/typography'
import { LAYOUT } from '@/lib/config/layout'

/** Map grandchild category slug → icon. Falls back to BookOpen. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  blueprint: Compass,
  'simply-explained': Lightbulb,
  videos: PlayCircle,
  guides: BookOpen,
}

interface PostPreview {
  id: string | number
  title: string
  excerpt: string
  isProOnly: boolean
}

interface CatalogCategory {
  name: string
  slug: string
  posts: PostPreview[]
}

interface CryptoSchoolCatalogProps {
  categories: CatalogCategory[]
}

export function CryptoSchoolCatalog({ categories }: CryptoSchoolCatalogProps) {
  return (
    <section
      id="catalog"
      className={`bg-surface-container-low rounded-2xl ${LAYOUT.spacing.section}`}
    >
      <SectionHeading
        variant="landing"
        overline="Curated Intelligence"
        subtitle="Explore our meticulously organized library of market blueprints, technical guides, and simplified concepts."
      >
        Knowledge, structured.
      </SectionHeading>

      {categories.length === 0 ? (
        <p className="text-on-surface-variant text-body-sm mt-10 text-center">
          Content coming soon. Check back shortly.
        </p>
      ) : (
        <div className={`mt-10 grid grid-cols-1 md:grid-cols-2 ${LAYOUT.spacing.gridGap}`}>
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] ?? BookOpen

            return (
              <div key={category.slug} className="flex flex-col gap-6">
                {/* Category header */}
                <div className="flex items-center gap-3">
                  <Icon className="text-primary size-7" />
                  <Heading as="h3" className="font-bold">
                    {category.name}
                  </Heading>
                </div>

                {/* Post previews */}
                {category.posts.length > 0 ? (
                  category.posts.map((post) => (
                    <div
                      key={post.id}
                      className={`bg-surface-container-lowest group hover:bg-surface relative cursor-pointer overflow-hidden rounded-2xl transition-colors ${LAYOUT.spacing.card}`}
                    >
                      {/* Left accent bar on hover */}
                      <div className="bg-primary absolute top-0 left-0 h-full w-1 origin-top scale-y-0 transition-transform group-hover:scale-y-100" />

                      <div className="flex flex-col gap-3">
                        {/* Access badge */}
                        <div className="flex items-center justify-between">
                          {post.isProOnly ? (
                            <span className="bg-tertiary-fixed text-on-tertiary-fixed text-overline flex items-center gap-1 rounded-full px-2.5 py-1 font-bold uppercase">
                              <Lock className="size-3" /> Pro Only
                            </span>
                          ) : (
                            <span className="bg-secondary-container text-on-secondary-container text-overline flex items-center gap-1 rounded-full px-2.5 py-1 font-bold uppercase">
                              <LockOpen className="size-3" /> Guest
                            </span>
                          )}
                        </div>

                        <Title as="h4" className="group-hover:text-primary transition-colors">
                          {post.title}
                        </Title>
                        <p className="text-on-surface-variant text-body-sm">{post.excerpt}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant text-body-sm">
                    Articles coming soon for this category.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
