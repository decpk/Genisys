import type { NewsArticle } from '@/store/news-tile-store'

/**
 * Returns a new array of news articles sorted newest-first by recency.
 *
 * Sort key: `publishedAt ?? fetchedAt` (descending).
 *
 * Why fall back to `fetchedAt`?
 *   `publishedAt` is nullable — AI-generated items frequently omit it. Falling
 *   back to `fetchedAt` keeps freshly fetched articles near the top instead of
 *   sinking them to the bottom as NULL-equivalents. This matches the SQL
 *   `ORDER BY COALESCE(published_at, fetched_at) DESC` used in the backend
 *   loader so display order is identical whether articles come from a just-
 *   completed fetch or from a database reload.
 *
 * Both `publishedAt` and `fetchedAt` are ISO-8601 strings, which sort
 * lexicographically — no Date parsing required.
 *
 * Pure: does not mutate the input array.
 */
export function sortNewsArticlesByRecency(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const aKey = a.publishedAt ?? a.fetchedAt
    const bKey = b.publishedAt ?? b.fetchedAt
    if (aKey === bKey) return 0
    return aKey < bKey ? 1 : -1
  })
}
