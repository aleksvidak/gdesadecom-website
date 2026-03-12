import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ActivityCard from '@/components/ActivityCard'
import { buildOrganizationSlug } from '@/lib/slug'
import { getOrganizationProfileBySlug, getPublishedOrganizationBySlug, getPublishedOrganizations } from '@/lib/supabase'

type OrganizationPageParams = {
  slug: string
}

export const revalidate = 3600

function formatRating(rating: number | null, count: number): string {
  if (!rating || count === 0) {
    return 'Novo'
  }

  const rounded = Math.round(rating * 10) / 10
  return `${rounded} ★ (${count})`
}

function normalizeWebsiteUrl(value: string | null): string | null {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

function normalizeInstagramUrl(value: string | null): string | null {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const normalizedHandle = value.replace(/^@/, '')
  return `https://instagram.com/${normalizedHandle}`
}

function buildStructuredData(
  slug: string,
  organization: Awaited<ReturnType<typeof getPublishedOrganizationBySlug>>,
  activitiesCount: number,
  primaryAddress: string | null,
  primaryCity: string | null
) {
  if (!organization) return null

  const websiteUrl = normalizeWebsiteUrl(organization.website)
  const instagramUrl = normalizeInstagramUrl(organization.instagram)
  const sameAs = [websiteUrl, instagramUrl].filter(Boolean) as string[]

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: organization.public_name,
    description: organization.description || undefined,
    url: `https://gdesadecom.rs/organizacije/${slug}`,
    image: organization.image_url || undefined,
    email: organization.email || undefined,
    telephone: organization.phone || undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    address:
      primaryAddress || primaryCity
        ? {
            '@type': 'PostalAddress',
            streetAddress: primaryAddress || undefined,
            addressLocality: primaryCity || undefined,
            addressCountry: 'RS',
          }
        : undefined,
    aggregateRating:
      organization.rating_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: organization.rating_avg,
            reviewCount: organization.rating_count,
          }
        : undefined,
    numberOfItems: activitiesCount,
  }
}

export async function generateStaticParams() {
  const organizations = await getPublishedOrganizations()
  return organizations.map((organization) => ({
    slug: buildOrganizationSlug(organization),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<OrganizationPageParams>
}): Promise<Metadata> {
  const { slug } = await params
  const organization = await getPublishedOrganizationBySlug(slug)

  if (!organization) {
    return {
      title: 'Organizacija nije pronađena',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const canonicalSlug = buildOrganizationSlug(organization)
  const fallbackDescription = `Pogledajte profil organizacije ${organization.public_name}, kontakt informacije, lokacije i aktivnosti za decu.`
  const description = organization.description?.trim() || fallbackDescription

  return {
    title: `${organization.public_name} — organizacija`,
    description,
    alternates: {
      canonical: `https://gdesadecom.rs/organizacije/${canonicalSlug}`,
    },
    openGraph: {
      title: `${organization.public_name} — aktivnosti za decu`,
      description,
      type: 'website',
      url: `https://gdesadecom.rs/organizacije/${canonicalSlug}`,
      images: organization.image_url
        ? [
            {
              url: organization.image_url,
              alt: organization.public_name,
            },
          ]
        : undefined,
    },
  }
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<OrganizationPageParams>
}) {
  const { slug } = await params
  const profile = await getOrganizationProfileBySlug(slug)

  if (!profile) {
    notFound()
  }

  const canonicalSlug = buildOrganizationSlug(profile.organization)
  if (slug !== canonicalSlug) {
    redirect(`/organizacije/${canonicalSlug}`)
  }

  const primaryVenue = profile.venues[0]
  const structuredData = buildStructuredData(
    canonicalSlug,
    profile.organization,
    profile.activities.length,
    primaryVenue?.address_line ?? null,
    primaryVenue?.city_name ?? null
  )

  const websiteUrl = normalizeWebsiteUrl(profile.organization.website)
  const instagramUrl = normalizeInstagramUrl(profile.organization.instagram)
  const phoneLink = profile.organization.phone?.replace(/\s+/g, '')

  return (
    <>
      <Header />

      <section className="max-w-[1100px] mx-auto px-8 pt-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div>
            <h1 className="font-extrabold text-4xl md:text-5xl leading-tight mb-3">
              {profile.organization.public_name}
            </h1>
            <p className="text-[#666] text-base md:text-lg mb-4">
              Profil organizacije sa lokacijama, kontaktima i aktivnostima za decu.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f0fdf4] text-[#15803d] font-semibold">
                Ocena: {formatRating(profile.organization.rating_avg, profile.organization.rating_count)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#ddd] text-[#444]">
                Aktivnosti: {profile.activities.length}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-[#ddd] text-[#444]">
                Lokacije: {profile.venues.length}
              </span>
            </div>
          </div>

          {profile.organization.image_url ? (
            <div className="rounded-2xl overflow-hidden border border-[#eee] bg-white">
              <Image
                src={profile.organization.image_url}
                alt={profile.organization.public_name}
                width={900}
                height={480}
                className="w-full h-[240px] object-cover"
                priority
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-[#eee] bg-gradient-to-br from-teal-100 to-indigo-100 h-[240px] flex items-center justify-center text-6xl">
              🏢
            </div>
          )}
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-8 pb-12">
        <div className="bg-white border border-[#eee] rounded-2xl p-6 md:p-8">
          <h2 className="font-bold text-2xl mb-4">O organizaciji</h2>
          <p className="text-[#555] leading-7">
            {profile.organization.description?.trim() || 'Opis organizacije uskoro stiže.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
            {profile.organization.phone && (
              <div className="bg-[#fafafa] border border-[#eee] rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Telefon</p>
                <a href={`tel:${phoneLink}`} className="font-semibold text-[#1a1a1a] hover:underline">
                  {profile.organization.phone}
                </a>
              </div>
            )}

            {profile.organization.email && (
              <div className="bg-[#fafafa] border border-[#eee] rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Email</p>
                <a
                  href={`mailto:${profile.organization.email}`}
                  className="font-semibold text-[#1a1a1a] hover:underline break-all"
                >
                  {profile.organization.email}
                </a>
              </div>
            )}

            {websiteUrl && (
              <div className="bg-[#fafafa] border border-[#eee] rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Sajt</p>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1a1a1a] hover:underline break-all"
                >
                  {profile.organization.website}
                </a>
              </div>
            )}

            {instagramUrl && (
              <div className="bg-[#fafafa] border border-[#eee] rounded-xl p-4">
                <p className="text-xs uppercase tracking-wide text-[#888] mb-1">Instagram</p>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#1a1a1a] hover:underline break-all"
                >
                  {profile.organization.instagram}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-8 pb-12">
        <h2 className="font-bold text-2xl mb-4">Lokacije</h2>

        {profile.venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.venues.map((venue) => {
              const mapUrl =
                venue.lat !== null && venue.lng !== null
                  ? `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`
                  : null

              return (
                <div key={venue.id} className="bg-white border border-[#eee] rounded-xl p-5">
                  <p className="font-semibold text-base mb-1">{venue.name}</p>
                  <p className="text-sm text-[#555]">{venue.address_line || 'Adresa nije dostupna'}</p>
                  <p className="text-sm text-[#888] mt-1">{venue.city_name || 'Grad nije naveden'}</p>
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex mt-3 text-sm font-semibold text-[#1a1a1a] hover:underline"
                    >
                      Otvori na mapi
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#eee] rounded-xl p-6">
            <p className="text-[#666]">Nema dostupnih lokacija za ovu organizaciju.</p>
          </div>
        )}
      </section>

      <section className="max-w-[1100px] mx-auto px-8 pb-24">
        <h2 className="font-bold text-2xl mb-4">Aktivnosti organizacije</h2>

        {profile.activities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.activities.map((activity) => (
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
          <div className="bg-white border border-[#eee] rounded-xl p-6">
            <p className="text-[#666]">
              Ova organizacija trenutno nema javno objavljene aktivnosti.
            </p>
          </div>
        )}
      </section>

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
