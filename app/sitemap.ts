import type { MetadataRoute } from 'next'
import { getActivityIdsForSitemap, getPublishedOrganizations } from '@/lib/supabase'
import { buildOrganizationSlug } from '@/lib/slug'

const BASE_URL = 'https://gdesadecom.rs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/aktivnosti`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const [activities, organizations] = await Promise.all([
    getActivityIdsForSitemap(),
    getPublishedOrganizations(),
  ])

  const activityRoutes: MetadataRoute.Sitemap = activities.map((a) => ({
    url: `${BASE_URL}/aktivnosti/${a.id}`,
    lastModified: new Date(a.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const organizationRoutes: MetadataRoute.Sitemap = organizations.map((org) => ({
    url: `${BASE_URL}/organizacije/${buildOrganizationSlug(org)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...activityRoutes, ...organizationRoutes]
}
