import { getCategoryById } from './getCategoryById'

/**
 * Generates the payload for a category id and serializes it as pretty JSON.
 * Categories that do not support a count always generate a single payload.
 */
export function buildDummyDataJson(categoryId: string, count: number): string {
  const category = getCategoryById(categoryId)
  if (!category) return ''
  const requested = category.supportsCount ? count : 1
  const safeCount = Math.max(1, Math.floor(requested))
  return JSON.stringify(category.generate(safeCount), null, 2)
}
