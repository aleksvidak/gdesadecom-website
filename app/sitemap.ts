import type { MetadataRoute } from 'next'
import {
  getActivitiesForSitemap,
  getActivityCategoriesWithSlugs,
  getPublishedOrganizations,
} from '@/lib/supabase'
import { buildActivitySlug, buildOrganizationSlug } from '@/lib/slug'

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
      url: `${BASE_URL}/beograd`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  const [activities, organizations, categories] = await Promise.all([
    getActivitiesForSitemap(),
    getPublishedOrganizations(),
    getActivityCategoriesWithSlugs(),
  ])

  const activityRoutes: MetadataRoute.Sitemap = activities.map((a) => ({
    url: `${BASE_URL}/aktivnosti/${buildActivitySlug(a)}`,
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

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/kategorije/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [...staticRoutes, ...categoryRoutes, ...activityRoutes, ...organizationRoutes]
}
