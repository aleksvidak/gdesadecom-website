import Image from 'next/image'
import type { Activity } from '@/lib/supabase'

const CATEGORY_ICONS: Record<string, string> = {
  Sport: '⚽',
  Umetnost: '🎨',
  Edukacija: '📚',
  Muzika: '🎵',
  Ples: '💃',
  Priroda: '🌿',
  Tehnologija: '🤖',
  Kultura: '🎭',
  Rodjendaonica: '🎂',
  Ostalo: '⭐',
}

function priceLabel(activity: Activity): string {
  if (activity.price_type === 'free') return 'Besplatno'
  if (activity.price_type === 'contact') return 'Kontaktirajte'
  if (activity.price_amount) {
    return `${activity.price_amount} ${activity.currency ?? 'RSD'}`
  }
  return 'Plaćeno'
}

export default function ActivityCard({ activity }: { activity: Activity }) {
  const icon = CATEGORY_ICONS[activity.category_name] ?? '⭐'

  return (
    <div className="bg-white border border-[#eee] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {activity.image_url ? (
        <div className="relative w-full aspect-video">
          <Image
            src={activity.image_url}
            alt={activity.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-4xl">
          {icon}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-[#f0fdf4] text-[#15803d] px-2 py-1 rounded-full font-medium">
            {icon} {activity.category_name}
          </span>
          <span className="text-xs text-[#888]">{activity.city_name}</span>
        </div>
        <h3 className="font-bold text-base mb-1 line-clamp-2">{activity.title}</h3>
        <p className="text-sm text-[#666] mb-3 line-clamp-2">{activity.description}</p>
        <div className="flex items-center justify-between text-xs text-[#888]">
          <span>{activity.org_name}</span>
          <span className="font-semibold text-[#1a1a1a]">{priceLabel(activity)}</span>
        </div>
        {(activity.age_min || activity.age_max) && (
          <p className="text-xs text-[#aaa] mt-1">
            Uzrast:{' '}
            {activity.age_min && activity.age_max
              ? `${activity.age_min}–${activity.age_max} god.`
              : activity.age_min
              ? `od ${activity.age_min} god.`
              : `do ${activity.age_max} god.`}
          </p>
        )}
      </div>
    </div>
  )
}
