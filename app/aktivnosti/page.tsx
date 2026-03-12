import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/ActivityCard'
import { getActivityCategories, getPublishedActivitiesPage } from '@/lib/supabase'

type ListingSearchParams = {
  kategorija?: string
  strana?: string
}

const PAGE_SIZE = 12

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Aktivnosti za decu',
  description:
    'Pregledajte aktivnosti za decu po kategorijama: sport, edukacija, umetnost i još mnogo toga.',
  alternates: {
    canonical: 'https://gdesadecom.rs/aktivnosti',
  },
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed) || parsed < 1) return fallback
  return parsed
}

function buildHref(categoryId?: string, page?: number): string {
  const params = new URLSearchParams()

  if (categoryId) {
    params.set('kategorija', categoryId)
  }

  if (page && page > 1) {
    params.set('strana', String(page))
  }

  const query = params.toString()
  return query ? `/aktivnosti?${query}` : '/aktivnosti'
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const windowSize = 5
  const halfWindow = Math.floor(windowSize / 2)
  const start = Math.max(1, currentPage - halfWindow)
  const end = Math.min(totalPages, start + windowSize - 1)
  const normalizedStart = Math.max(1, end - windowSize + 1)

  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index)
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<ListingSearchParams>
}) {
  const resolvedSearchParams = await searchParams
  const selectedCategoryId = resolvedSearchParams.kategorija
  const requestedPage = parsePositiveInt(resolvedSearchParams.strana, 1)

  const categories = await getActivityCategories()
  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)

  const listing = await getPublishedActivitiesPage(
    requestedPage,
    PAGE_SIZE,
    selectedCategory ? selectedCategory.id : undefined
  )

  const currentPage = listing.page
  const pages = getVisiblePages(currentPage, listing.totalPages)

  return (
    <>
      <Header />

      <section className="max-w-[1100px] mx-auto px-8 pt-10 pb-16">
        <h1 className="font-extrabold text-4xl md:text-5xl leading-tight mb-3">
          Aktivnosti za decu
        </h1>
        <p className="text-[#666] text-base md:text-lg max-w-[720px]">
          Pronađite sport, kreativne radionice, edukativne programe i još mnogo toga. Filtrirajte
          po kategoriji i istražite ponudu u vašem gradu.
        </p>
      </section>

      <section className="max-w-[1100px] mx-auto px-8 pb-24">
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={buildHref(undefined, 1)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !selectedCategory
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-[#ddd] text-[#444] hover:border-[#1a1a1a]'
            }`}
          >
            Sve kategorije ({listing.totalCount})
          </Link>
          {categories.map((category) => {
            const isSelected = selectedCategory?.id === category.id
            return (
              <Link
                key={category.id}
                href={buildHref(category.id, 1)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-[#1a1a1a] text-white'
                    : 'bg-white border border-[#ddd] text-[#444] hover:border-[#1a1a1a]'
                }`}
              >
                {category.name} ({category.count})
              </Link>
            )
          })}
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <p className="text-sm text-[#666]">
            {selectedCategory
              ? `${listing.totalCount} aktivnosti u kategoriji „${selectedCategory.name}”`
              : `${listing.totalCount} aktivnosti ukupno`}
          </p>
          {listing.totalPages > 0 && (
            <p className="text-sm text-[#666]">
              Strana {currentPage} od {listing.totalPages}
            </p>
          )}
        </div>

        {listing.activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listing.activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#eee] rounded-xl p-8 text-center">
            <p className="text-lg font-semibold mb-2">Nema aktivnosti za izabrani filter</p>
            <p className="text-[#666] mb-4">Probajte drugu kategoriju ili pogledajte ceo katalog.</p>
            <Link
              href="/aktivnosti"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm font-semibold"
            >
              Prikaži sve aktivnosti
            </Link>
          </div>
        )}

        {listing.totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacija">
            <Link
              href={buildHref(selectedCategory?.id, Math.max(1, currentPage - 1))}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                currentPage === 1
                  ? 'pointer-events-none bg-[#f5f5f5] text-[#aaa] border-[#eee]'
                  : 'bg-white text-[#333] border-[#ddd] hover:border-[#1a1a1a]'
              }`}
            >
              Prethodna
            </Link>

            {pages.map((page) => (
              <Link
                key={page}
                href={buildHref(selectedCategory?.id, page)}
                className={`min-w-10 text-center px-3 py-2 rounded-lg text-sm font-semibold border ${
                  page === currentPage
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'bg-white text-[#333] border-[#ddd] hover:border-[#1a1a1a]'
                }`}
              >
                {page}
              </Link>
            ))}

            <Link
              href={buildHref(selectedCategory?.id, Math.min(listing.totalPages, currentPage + 1))}
              className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                currentPage === listing.totalPages
                  ? 'pointer-events-none bg-[#f5f5f5] text-[#aaa] border-[#eee]'
                  : 'bg-white text-[#333] border-[#ddd] hover:border-[#1a1a1a]'
              }`}
            >
              Sledeća
            </Link>
          </nav>
        )}
      </section>

      <Footer />
    </>
  )
}
