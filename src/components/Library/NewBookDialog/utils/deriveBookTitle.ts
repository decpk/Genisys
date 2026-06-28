export function deriveBookTitle(userOverride: string, crawledTitle: string | undefined): string {
  const trimmedOverride = userOverride.trim()
  if (trimmedOverride) return trimmedOverride
  const trimmedCrawled = (crawledTitle ?? '').trim()
  if (trimmedCrawled) return trimmedCrawled
  return 'Untitled Book'
}
