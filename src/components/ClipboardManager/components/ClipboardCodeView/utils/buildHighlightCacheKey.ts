/**
 * Builds a stable cache key for a (lang, theme, code) triple.
 * Length is included as a quick collision guard against rare prefix collisions.
 */
export function buildHighlightCacheKey(lang: string, theme: string, code: string): string {
  return `${lang}|${theme}|${code.length}|${code}`
}
