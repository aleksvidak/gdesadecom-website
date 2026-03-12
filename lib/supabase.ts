import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Read-only Supabase client for public catalog queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Activity = {
  id: string
  title: string
  description: string | null
  age_min: number | null
  age_max: number | null
  indoor_outdoor: 'indoor' | 'outdoor' | 'both' | null
  price_type: 'free' | 'paid' | 'contact' | null
  price_amount: number | null
  currency: string | null
  image_url: string | null
  view_count: number
  favorite_count: number
  is_featured: boolean
  category_id: string
  category_name: string
  organization_id: string
  org_name: string
  venue_id: string
  venue_name: string
  address_line: string | null
  lat: number | null
  lng: number | null
  city_id: string
  city_name: string
  created_at: string
}

export async function getPublishedActivities(limit = 20): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('*')
    .limit(limit)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  return data as Activity[]
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Activity
}
