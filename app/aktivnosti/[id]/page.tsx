import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getActivityById } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const activity = await getActivityById(id)
  if (!activity) return { title: 'Aktivnost nije pronađena' }

  return {
    title: activity.title,
    description: activity.description ?? `${activity.title} — ${activity.org_name}`,
    alternates: {
      canonical: `https://gdesadecom.rs/aktivnosti/${id}`,
    },
    openGraph: {
      title: activity.title,
      description: activity.description ?? `${activity.title} — ${activity.org_name}`,
      images: activity.image_url ? [{ url: activity.image_url }] : [],
    },
  }
}

export const revalidate = 3600

export default async function ActivityDetailPage({ params }: Props) {
  const { id } = await params
  const activity = await getActivityById(id)

  if (!activity) notFound()

  const priceLabel = () => {
    if (activity.price_type === 'free') return 'Besplatno'
    if (activity.price_type === 'contact') return 'Kontaktirajte za cenu'
    if (activity.price_amount) return `${activity.price_amount} ${activity.currency ?? 'RSD'}`
    return 'Plaćeno'
  }

  const ageLabel = () => {
    if (activity.age_min && activity.age_max) return `${activity.age_min}–${activity.age_max} god.`
    if (activity.age_min) return `Od ${activity.age_min} god.`
    if (activity.age_max) return `Do ${activity.age_max} god.`
    return null
  }

  return (
    <>
      <Header />
      <main className="max-w-[800px] mx-auto px-8 py-12">
        <nav className="text-sm text-[#888] mb-8">
          <Link href="/aktivnosti" className="hover:text-[#1a1a1a] transition-colors">
            ← Sve aktivnosti
          </Link>
        </nav>

        {activity.image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8">
            <Image
              src={activity.image_url}
              alt={activity.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-medium bg-[#f0f0f0] text-[#555] px-3 py-1 rounded-full">
            {activity.category_name}
          </span>
          {activity.is_featured && (
            <span className="text-xs font-medium bg-[#fff8e1] text-[#b45309] px-3 py-1 rounded-full">
              Istaknuto
            </span>
          )}
        </div>

        <h1 className="font-extrabold text-3xl md:text-4xl text-[#1a1a1a] mb-2 mt-4">
          {activity.title}
        </h1>
        <p className="text-[#666] mb-6">{activity.org_name}</p>

        <div className="flex flex-wrap gap-3 mb-8">
          <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
            {priceLabel()}
          </span>
          {ageLabel() && (
            <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
              {ageLabel()}
            </span>
          )}
          {activity.indoor_outdoor && (
            <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
              {activity.indoor_outdoor === 'indoor'
                ? 'Zatvoreni prostor'
                : activity.indoor_outdoor === 'outdoor'
                  ? 'Otvoreni prostor'
                  : 'Zatvoreni i otvoreni'}
            </span>
          )}
          {activity.city_name && (
            <span className="text-sm bg-[#f5f5f5] text-[#444] px-3 py-1.5 rounded-lg font-medium">
              📍 {activity.city_name}
            </span>
          )}
        </div>

        {activity.description && (
          <div className="prose max-w-none text-[#444] leading-relaxed mb-10">
            <p>{activity.description}</p>
          </div>
        )}

        <div className="bg-[#f8f8f8] rounded-2xl p-6">
          <h2 className="font-bold text-lg text-[#1a1a1a] mb-1">{activity.org_name}</h2>
          {activity.venue_name && (
            <p className="text-[#666] text-sm mb-1">{activity.venue_name}</p>
          )}
          {activity.address_line && (
            <p className="text-[#888] text-sm">{activity.address_line}</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
