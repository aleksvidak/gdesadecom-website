import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/ActivityCard'
import { getActivityCategoriesWithSlugs, getPublishedActivitiesByCityName } from '@/lib/supabase'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Aktivnosti za decu u Beogradu',
  description:
    'Pregledajte aktivnosti za decu u Beogradu: sport, umetnost, edukacija i još mnogo toga na jednom mestu.',
  alternates: {
    canonical: 'https://gdesadecom.rs/beograd',
  },
  openGraph: {
    title: 'Aktivnosti za decu u Beogradu',
    description:
      'Pronađite proverene aktivnosti za decu u Beogradu i otvorite detalje svake aktivnosti.',
    type: 'website',
    url: 'https://gdesadecom.rs/beograd',
  },
}

export default async function BelgradePage() {
  const [activities, categories] = await Promise.all([
    getPublishedActivitiesByCityName('Beograd', 120),
    getActivityCategoriesWithSlugs(),
  ])

  const categoryCounts = new Map<string, number>()
  for (const activity of activities) {
    const previousCount = categoryCounts.get(activity.category_id) ?? 0
    categoryCounts.set(activity.category_id, previousCount + 1)
  }

  const topCategories = categories
    .filter((category) => categoryCounts.has(category.id))
    .map((category) => ({
      ...category,
      cityCount: categoryCounts.get(category.id) ?? 0,
    }))
    .sort((left, right) => right.cityCount - left.cityCount)

  return (
    <>
      <Header />

      <section className="max-w-[1100px] mx-auto px-8 pt-10 pb-10">
        <h1 className="font-extrabold text-4xl md:text-5xl leading-tight mb-3">
          Aktivnosti za decu u Beogradu
        </h1>
        <p className="text-[#666] text-base md:text-lg max-w-[760px]">
          Pronađite proverene aktivnosti po celom Beogradu. Istražite sport, umetnost, edukaciju i
          druge programe, pa otvorite detalje aktivnosti koja najviše odgovara vašem detetu.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {topCategories.map((category) => (
            <Link
              key={category.id}
              href={`/kategorije/${category.slug}`}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white border border-[#ddd] text-[#444] hover:border-[#1a1a1a]"
            >
              {category.name} ({category.cityCount})
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-8 pb-24">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#666]">
            Ukupno aktivnosti u Beogradu: <span className="font-semibold text-[#1a1a1a]">{activities.length}</span>
          </p>
          <Link
            href="/aktivnosti"
            className="text-sm font-semibold text-[#1a1a1a] hover:underline"
          >
            Sve aktivnosti →
          </Link>
        </div>

        {activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id}>
                <Link href={`/aktivnosti/${activity.id}`} className="block">
                  <ActivityCard activity={activity} />
                </Link>
                <Link
                  href={`/aktivnosti/${activity.id}`}
                  className="inline-flex mt-2 text-sm font-semibold text-[#1a1a1a] hover:underline"
                >
                  Pogledaj detalje aktivnosti →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#eee] rounded-xl p-8 text-center">
            <p className="text-lg font-semibold mb-2">Trenutno nema aktivnosti za Beograd</p>
            <p className="text-[#666] mb-4">
              Čim se objave nove aktivnosti, pojaviće se na ovoj stranici.
            </p>
            <Link
              href="/aktivnosti"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm font-semibold"
            >
              Idi na katalog aktivnosti
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </>
  )
}
