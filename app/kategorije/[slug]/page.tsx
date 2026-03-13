import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/ActivityCard'
import {
  getActivityCategoriesWithSlugs,
  getActivityCategoryBySlug,
  getPublishedActivitiesByCategory,
} from '@/lib/supabase'
import { buildActivitySlug } from '@/lib/slug'

type CategoryPageParams = {
  slug: string
}

export const revalidate = 3600

export async function generateStaticParams() {
  const categories = await getActivityCategoriesWithSlugs()

  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CategoryPageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getActivityCategoryBySlug(slug)

  if (!category) {
    return {
      title: 'Kategorija nije pronađena',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const description = `Pregledajte aktivnosti za decu u kategoriji ${category.name}. Uporedite ponudu i pronađite idealan program za vaše dete.`

  return {
    title: `${category.name} aktivnosti za decu`,
    description,
    alternates: {
      canonical: `https://gdesadecom.rs/kategorije/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} aktivnosti za decu`,
      description,
      type: 'website',
      url: `https://gdesadecom.rs/kategorije/${category.slug}`,
    },
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<CategoryPageParams>
}) {
  const { slug } = await params
  const category = await getActivityCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const activities = await getPublishedActivitiesByCategory(category.id, 120)

  return (
    <>
      <Header />

      <section className="max-w-[1100px] mx-auto px-8 pt-10 pb-10">
        <p className="text-sm text-[#666] mb-3">
          <Link href="/aktivnosti" className="hover:text-[#1a1a1a] transition-colors">
            Aktivnosti
          </Link>{' '}
          / <span className="text-[#1a1a1a]">Kategorija</span>
        </p>
        <h1 className="font-extrabold text-4xl md:text-5xl leading-tight mb-3">
          {category.name} aktivnosti za decu
        </h1>
        <p className="text-[#666] text-base md:text-lg max-w-[760px]">
          Otkrijte {category.count} aktivnosti iz kategorije {category.name.toLowerCase()}. Svaka
          stranica vodi do detalja aktivnosti sa opisom, uzrastom i informacijama o organizaciji.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link
            href="/aktivnosti"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-[#ddd] text-sm font-semibold text-[#333] hover:border-[#1a1a1a]"
          >
            Sve kategorije
          </Link>
          <Link
            href="/beograd"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-[#ddd] text-sm font-semibold text-[#333] hover:border-[#1a1a1a]"
          >
            Aktivnosti u Beogradu
          </Link>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-8 pb-24">
        {activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <div key={activity.id}>
                <Link href={`/aktivnosti/${buildActivitySlug(activity)}`} className="block">
                  <ActivityCard activity={activity} />
                </Link>
                <Link
                  href={`/aktivnosti/${buildActivitySlug(activity)}`}
                  className="inline-flex mt-2 text-sm font-semibold text-[#1a1a1a] hover:underline"
                >
                  Pogledaj detalje aktivnosti →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#eee] rounded-xl p-8 text-center">
            <p className="text-lg font-semibold mb-2">Trenutno nema aktivnosti u ovoj kategoriji</p>
            <p className="text-[#666] mb-4">Pogledajte ostale kategorije ili sve aktivnosti.</p>
            <Link
              href="/aktivnosti"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm font-semibold"
            >
              Prikaži sve aktivnosti
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </>
  )
}
