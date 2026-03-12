type HasNameAndId = {
  id: string
  public_name: string
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function buildOrganizationSlug(organization: HasNameAndId): string {
  const nameSlug = slugify(organization.public_name)
  if (!nameSlug) return organization.id
  return `${nameSlug}-${organization.id}`
}

export function extractUuidFromSlug(slug: string): string | null {
  if (UUID_PATTERN.test(slug)) {
    return slug
  }

  const parts = slug.split('-')
  if (parts.length < 5) return null

  const candidate = parts.slice(-5).join('-')
  return UUID_PATTERN.test(candidate) ? candidate : null
}
