import { createClient } from '@supabase/supabase-js'
import { buildActivitySlug, extractUuidFromSlug, slugify } from './slug'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Read-only Supabase client for public catalog queries
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ActivityTag = {
  id: string
  name: string
}

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
  rating_avg: number | null
  rating_count: number
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

export type ActivityCategory = {
  id: string
  name: string
  sort_order: number | null
  count: number
}

export type ActivityCategoryWithSlug = ActivityCategory & {
  slug: string
}

export type Organization = {
  id: string
  public_name: string
  description: string | null
  image_url: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  rating_avg: number | null
  rating_count: number
}

export type OrganizationVenue = {
  id: string
  name: string
  address_line: string | null
  city_name: string | null
  lat: number | null
  lng: number | null
}

export type OrganizationProfile = {
  organization: Organization
  venues: OrganizationVenue[]
  activities: Activity[]
}

export type ActivitiesPage = {
  activities: Activity[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
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

export async function getActivityCategories(): Promise<ActivityCategory[]> {
  const [categoriesResult, activitiesResult] = await Promise.all([
    supabase
      .from('category')
      .select('id, name, sort_order, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true }),
    supabase.from('v_activity_public').select('category_id, category_name'),
  ])

  if (categoriesResult.error) {
    console.error('Error fetching categories:', categoriesResult.error)
    return []
  }

  if (activitiesResult.error) {
    console.error('Error fetching category usage:', activitiesResult.error)
    return []
  }

  const counts = new Map<string, number>()
  for (const row of activitiesResult.data) {
    const existing = counts.get(row.category_id) ?? 0
    counts.set(row.category_id, existing + 1)
  }

  return categoriesResult.data
    .map((category) => ({
      id: category.id,
      name: category.name,
      sort_order: category.sort_order,
      count: counts.get(category.id) ?? 0,
    }))
    .filter((category) => category.count > 0)
}

export async function getActivityCategoriesWithSlugs(): Promise<ActivityCategoryWithSlug[]> {
  const categories = await getActivityCategories()
  const usedSlugs = new Set<string>()

  return categories.map((category) => {
    const baseSlug = slugify(category.name) || category.id
    let slug = baseSlug
    let suffix = 2

    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }

    usedSlugs.add(slug)

    return {
      ...category,
      slug,
    }
  })
}

export async function getActivityCategoryBySlug(slug: string): Promise<ActivityCategoryWithSlug | null> {
  const categories = await getActivityCategoriesWithSlugs()
  return categories.find((category) => category.slug === slug) ?? null
}

export async function getPublishedActivitiesPage(
  page = 1,
  pageSize = 12,
  categoryId?: string
): Promise<ActivitiesPage> {
  const safePageSize = Math.max(1, pageSize)
  const safePage = Math.max(1, page)

  let countQuery = supabase.from('v_activity_public').select('id', { count: 'exact', head: true })
  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId)
  }

  const { error: countError, count } = await countQuery
  if (countError) {
    console.error('Error counting paginated activities:', countError)
    return {
      activities: [],
      page: 1,
      pageSize: safePageSize,
      totalCount: 0,
      totalPages: 0,
    }
  }

  const totalCount = count ?? 0
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / safePageSize)
  const normalizedPage = totalPages === 0 ? 1 : Math.min(safePage, totalPages)
  const rangeStart = (normalizedPage - 1) * safePageSize
  const rangeEnd = rangeStart + safePageSize - 1

  let dataQuery = supabase
    .from('v_activity_public')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (categoryId) {
    dataQuery = dataQuery.eq('category_id', categoryId)
  }

  const { data, error } = await dataQuery.range(rangeStart, rangeEnd)
  if (error) {
    console.error('Error fetching paginated activities:', error)
    return {
      activities: [],
      page: normalizedPage,
      pageSize: safePageSize,
      totalCount,
      totalPages,
    }
  }

  return {
    activities: data as Activity[],
    page: normalizedPage,
    pageSize: safePageSize,
    totalCount,
    totalPages,
  }
}

export async function getPublishedActivitiesByOrganization(
  organizationId: string,
  limit = 24
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('*')
    .eq('organization_id', organizationId)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching organization activities:', error)
    return []
  }

  return data as Activity[]
}

export async function getPublishedActivitiesByCategory(
  categoryId: string,
  limit = 60
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('*')
    .eq('category_id', categoryId)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching category activities:', error)
    return []
  }

  return data as Activity[]
}

export async function getPublishedActivitiesByCityName(
  cityName: string,
  limit = 120
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('*')
    .ilike('city_name', `%${cityName}%`)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching city activities:', error)
    return []
  }

  return data as Activity[]
}

export async function getPublishedOrganizations(): Promise<Pick<Organization, 'id' | 'public_name'>[]> {
  const { data, error } = await supabase
    .from('organization')
    .select('id, public_name')
    .eq('status', 'published')
    .order('public_name', { ascending: true })

  if (error) {
    console.error('Error fetching organizations:', error)
    return []
  }

  return data as Pick<Organization, 'id' | 'public_name'>[]
}

export async function getPublishedOrganizationById(id: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from('organization')
    .select('id, public_name, description, image_url, phone, email, website, instagram, rating_avg, rating_count')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) {
    if (error) {
      console.error('Error fetching organization by id:', error)
    }
    return null
  }

  return data as Organization
}

export async function getPublishedOrganizationBySlug(slug: string): Promise<Organization | null> {
  const idFromSlug = extractUuidFromSlug(slug)
  if (idFromSlug) {
    return getPublishedOrganizationById(idFromSlug)
  }

  const organizations = await getPublishedOrganizations()
  const match = organizations.find((organization) => slugify(organization.public_name) === slug)
  if (!match) {
    return null
  }

  return getPublishedOrganizationById(match.id)
}

export async function getOrganizationVenues(organizationId: string): Promise<OrganizationVenue[]> {
  const { data, error } = await supabase
    .from('venue')
    .select('id, name, address_line, lat, lng, city:city_id(name)')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching organization venues:', error)
    return []
  }

  type VenueRow = {
    id: string
    name: string
    address_line: string | null
    lat: number | null
    lng: number | null
    city: { name: string } | Array<{ name: string }> | null
  }

  return (data as VenueRow[]).map((row) => {
    const city = Array.isArray(row.city) ? row.city[0] : row.city
    return {
      id: row.id,
      name: row.name,
      address_line: row.address_line,
      city_name: city?.name ?? null,
      lat: row.lat,
      lng: row.lng,
    }
  })
}

export async function getOrganizationProfileBySlug(slug: string): Promise<OrganizationProfile | null> {
  const organization = await getPublishedOrganizationBySlug(slug)
  if (!organization) {
    return null
  }

  const [venues, activities] = await Promise.all([
    getOrganizationVenues(organization.id),
    getPublishedActivitiesByOrganization(organization.id, 48),
  ])

  return {
    organization,
    venues,
    activities,
  }
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

export async function getActivitiesForSitemap(): Promise<
  { id: string; title: string; created_at: string }[]
> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activities for sitemap:', error)
    return []
  }

  return data as { id: string; title: string; created_at: string }[]
}

export async function getActivityBySlug(slug: string): Promise<Activity | null> {
  const id = extractUuidFromSlug(slug)
  if (!id) return null
  return getActivityById(id)
}

export async function getActivityTags(activityId: string): Promise<ActivityTag[]> {
  const { data, error } = await supabase
    .from('activity_tag')
    .select('tag:tag_id(id, name)')
    .eq('activity_id', activityId)

  if (error) {
    console.error('Error fetching activity tags:', error)
    return []
  }

  type TagRow = { tag: { id: string; name: string } | Array<{ id: string; name: string }> | null }

  return (data as TagRow[])
    .map((row) => {
      const tag = Array.isArray(row.tag) ? row.tag[0] : row.tag
      return tag ? { id: tag.id, name: tag.name } : null
    })
    .filter((t): t is ActivityTag => t !== null)
}

export async function getAllPublishedActivitiesForStaticParams(): Promise<
  { id: string; title: string }[]
> {
  const { data, error } = await supabase
    .from('v_activity_public')
    .select('id, title')

  if (error) {
    console.error('Error fetching activities for static params:', error)
    return []
  }

  return data as { id: string; title: string }[]
}

export function buildCanonicalActivitySlug(activity: { id: string; title: string }): string {
  return buildActivitySlug(activity)
}
