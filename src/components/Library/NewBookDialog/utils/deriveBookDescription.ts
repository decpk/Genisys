export function deriveBookDescription(userOverride: string, crawledDescription: string | undefined): string {
  const trimmedOverride = userOverride.trim()
  if (trimmedOverride) return trimmedOverride
  const trimmedCrawled = (crawledDescription ?? '').trim()
  return trimmedCrawled
}
