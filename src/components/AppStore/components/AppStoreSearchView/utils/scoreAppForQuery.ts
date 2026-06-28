import type { AppCatalogEntry } from '../../../AppStore.types'

/**
 * Rank a catalog entry against a normalized lowercased query. Higher
 * scores = better match. Returns 0 when the entry should be filtered
 * out entirely.
 */
export function scoreAppForQuery(
  app: AppCatalogEntry,
  q: string,
): number {
  const name = app.name.toLowerCase()
  const tagline = app.tagline.toLowerCase()
  const description = app.description.toLowerCase()

  let score = 0
  if (name === q) score += 100
  if (name.startsWith(q)) score += 40
  if (name.includes(q)) score += 20
  if (tagline.includes(q)) score += 10
  if (description.includes(q)) score += 5

  for (const f of app.features) {
    if (f.title.toLowerCase().includes(q)) score += 6
    if (f.description.toLowerCase().includes(q)) score += 2
  }
  return score
}
