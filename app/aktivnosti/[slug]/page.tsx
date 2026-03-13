import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { buildActivitySlug, buildOrganizationSlug, extractUuidFromSlug } from '@/lib/slug'
import {
  getAllPublishedActivitiesForStaticParams,
  getActivityById,
  getActivityTags,
  getPublishedOrganizationById,
  type Activity,
} from '@/lib/supabase'

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const activities = await getAllPublishedActivitiesForStaticParams()
  return activities.map((activity) => ({
    slug: buildActivitySlug(activity),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = extractUuidFromSlug(slug)
  if (!id) return { title: 'Aktivnost nije pronađena', robots: { index: false, follow: false } }

  const activity = await getActivityById(id)
  if (!activity) return { title: 'Aktivnost nije pronađena', robots: { index: false, follow: false } }

  const canonicalSlug = buildActivitySlug(activity)
  const description =
    activity.description?.trim() ||
    `${activity.title} — ${activity.org_name}. Aktivnost za decu u ${activity.city_name}.`

  return {
    title: `${activity.title} — ${activity.org_name}`,
    description,
    alternates: {
      canonical: `https://gdesadecom.rs/aktivnosti/${canonicalSlug}`,
    },
    openGraph: {
      title: activity.title,
      description,
      type: 'website',
      url: `https://gdesadecom.rs/aktivnosti/${canonicalSlug}`,
      images: activity.image_url ? [{ url: activity.image_url, alt: activity.title }] : undefined,
    },
  }
}

function buildStructuredData(
  activity: Activity,
  slug: string,
  tags: { id: string; name: string }[]
) {
  const priceSpec =
    activity.price_type === 'free'
      ? { '@type': 'Offer', price: '0', priceCurrency: 'RSD', availability: 'https://schema.org/InStock' }
      : activity.price_type === 'paid' && activity.price_amount
        ? {
            '@type': 'Offer',
            price: String(activity.price_amount),
            priceCurrency: activity.currency ?? 'RSD',
            availability: 'https://schema.org/InStock',
          }
        : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: activity.title,
    description: activity.description || undefined,
    url: `https://gdesadecom.rs/aktivnosti/${slug}`,
    image: activity.image_url || undefined,
    organizer: {
      '@type': 'Organization',
      name: activity.org_name,
    },
    location:
      activity.address_line || activity.city_name
        ? {
            '@type': 'Place',
            name: activity.venue_name || activity.org_name,
            address: {
              '@type': 'PostalAddress',
              streetAddress: activity.address_line || undefined,
              addressLocality: activity.city_name || undefined,
              addressCountry: 'RS',
            },
          }
        : undefined,
    offers: priceSpec,
    typicalAgeRange:
      activity.age_min || activity.age_max
        ? `${activity.age_min ?? 0}-${activity.age_max ?? 99}`
        : undefined,
    keywords: tags.length > 0 ? tags.map((t) => t.name).join(', ') : undefined,
    aggregateRating:
      activity.rating_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: activity.rating_avg,
            reviewCount: activity.rating_count,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }
}

function getPriceLabel(activity: Activity): string {
  if (activity.price_type === 'free') return 'Besplatno'
  if (activity.price_type === 'contact') return 'Kontaktirajte za cenu'
  if (activity.price_amount) return `${activity.price_amount} ${activity.currency ?? 'RSD'}`
  return 'Plaćeno'
}

function getAgeLabel(activity: Activity): string | null {
  if (activity.age_min && activity.age_max) return `${activity.age_min}–${activity.age_max} god.`
  if (activity.age_min) return `Od ${activity.age_min} god.`
  if (activity.age_max) return `Do ${activity.age_max} god.`
  return null
}

function getIndoorOutdoorLabel(value: string | null): string | null {
  if (value === 'indoor') return 'Zatvoreni prostor'
  if (value === 'outdoor') return 'Otvoreni prostor'
  if (value === 'both') return 'Zatvoreni i otvoreni'
  return null
}

function renderStarRating(avg: number, count: number) {
  const rounded = Math.round(avg * 10) / 10
  const fullStars = Math.round(avg)
  const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars)

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-amber-500 text-lg tracking-tighter" aria-hidden="true">{stars}</span>
      <span className="font-semibold text-[#1a1a1a]">{rounded}</span>
      <span className="text-[#888] text-sm">({count} {count === 1 ? 'ocena' : 'ocena'})</span>
    </div>
  )
}

const TAG_LABELS: Record<string, string> = {
  beginner_friendly: 'Za početnike',
  drop_in: 'Bez prijave',
  seasonal: 'Sezonski',
  indoor: 'Zatvoreno',
  outdoor: 'Na otvorenom',
  competitive: 'Takmičarski',
  group: 'Grupno',
  individual: 'Individualno',
}

export default async function ActivityDetailPage({ params }: Props) {
  const { slug } = await params

  const id = extractUuidFromSlug(slug)
  if (!id) notFound()

  const [activity, tags] = await Promise.all([getActivityById(id), getActivityTags(id)])

  if (!activity) notFound()

  const canonicalSlug = buildActivitySlug(activity)
  if (slug !== canonicalSlug) {
    redirect(`/aktivnosti/${canonicalSlug}`)
  }

  const organization = await getPublishedOrganizationById(activity.organization_id)
  const orgSlug = organization
    ? buildOrganizationSlug({ id: organization.id, public_name: organization.public_name })
    : null

  const structuredData = buildStructuredData(activity, canonicalSlug, tags)

  const mapUrl =
    activity.lat !== null && activity.lng !== null
      ? `https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}`
      : null

  const ageText = getAgeLabel(activity)
  const indoorText = getIndoorOutdoorLabel(activity.indoor_outdoor)

  return (
    <>
      <Header />

      <main className="max-w-[860px] mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#888] mb-8 flex items-center gap-2">
          <Link href="/aktivnosti" className="hover:text-[#1a1a1a] transition-colors">
            Aktivnosti
          </Link>
          <span>/</span>
          <span className="text-[#555]">{activity.category_name}</span>
        </nav>

        {/* Hero image */}
        {activity.image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-sm">
            <Image
              src={activity.image_url}
              alt={activity.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 860px) 100vw, 860px"
            />
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold bg-[#f0fdf4] text-[#15803d] px-3 py-1 rounded-full">
            {activity.category_name}
          </span>
          {activity.is_featured && (
            <span className="text-xs font-semibold bg-[#fff8e1] text-[#b45309] px-3 py-1 rounded-full">
              Istaknuto
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-extrabold text-3xl md:text-4xl text-[#1a1a1a] mb-2 mt-3 leading-tight">
          {activity.title}
        </h1>

        {/* Org link */}
        {orgSlug ? (
          <Link
            href={`/organizacije/${orgSlug}`}
            className="text-[#555] hover:text-[#1a1a1a] hover:underline transition-colors mb-6 block"
          >
            {activity.org_name}
          </Link>
        ) : (
          <p className="text-[#555] mb-6">{activity.org_name}</p>
        )}

        {/* Rating */}
        {activity.rating_count > 0 && activity.rating_avg !== null &&
          renderStarRating(activity.rating_avg, activity.rating_count)}

        {/* Key info chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
            {getPriceLabel(activity)}
          </span>
          {ageText && (
            <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
              Uzrast: {ageText}
            </span>
          )}
          {indoorText && (
            <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
              {indoorText}
            </span>
          )}
          {activity.city_name && (
            <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
              📍 {activity.city_name}
            </span>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs bg-[#eff6ff] text-[#1d4ed8] px-3 py-1 rounded-full font-medium"
              >
                {TAG_LABELS[tag.name] ?? tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <div className="bg-white border border-[#eee] rounded-2xl p-6 mb-6">
            <h2 className="font-bold text-lg text-[#1a1a1a] mb-3">O aktivnosti</h2>
            <p className="text-[#444] leading-7 whitespace-pre-line">{activity.description}</p>
          </div>
        )}

        {/* Venue & location */}
        <div className="bg-[#f8f8f8] rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-lg text-[#1a1a1a] mb-3">Lokacija</h2>
          {orgSlug ? (
            <Link
              href={`/organizacije/${orgSlug}`}
              className="font-semibold text-[#1a1a1a] hover:underline"
            >
              {activity.org_name}
            </Link>
          ) : (
            <p className="font-semibold text-[#1a1a1a]">{activity.org_name}</p>
          )}
          {activity.venue_name && (
            <p className="text-[#555] text-sm mt-1">{activity.venue_name}</p>
          )}
          {activity.address_line && (
            <p className="text-[#888] text-sm mt-1">{activity.address_line}</p>
          )}
          {activity.city_name && (
            <p className="text-[#888] text-sm mt-0.5">{activity.city_name}</p>
          )}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-4 text-sm font-semibold text-[#1a1a1a] hover:underline"
            >
              Otvori na mapi →
            </a>
          )}
        </div>

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-[#eee]">
          <Link
            href="/aktivnosti"
            className="text-sm font-semibold text-[#555] hover:text-[#1a1a1a] transition-colors"
          >
            ← Sve aktivnosti
          </Link>
        </div>
      </main>

      <Footer />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </>
  )
}
