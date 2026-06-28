import type { Chapter } from '@/store/library-store'

/**
 * Computes a percent-complete value based on chapters marked `isRead`.
 * Returns 0 when no chapters provided.
 */
export function computeReadingProgress(chapters: Chapter[] | undefined): number {
  if (!chapters || chapters.length === 0) return 0
  const read = chapters.filter((c) => c.isRead).length
  return Math.round((read / chapters.length) * 100)
}
