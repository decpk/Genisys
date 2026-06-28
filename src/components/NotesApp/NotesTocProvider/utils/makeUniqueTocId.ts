/**
 * Generates a TOC item id of the form `<prefix>-<slug>` (first occurrence) or
 * `<prefix>-<slug>-<n>` for repeat slugs. The `seen` map is mutated so callers
 * can share a single counter across one extraction pass.
 */
export function makeUniqueTocId(prefix: string, slug: string, seen: Map<string, number>): string {
  const key = slug || 'item'
  const count = (seen.get(key) ?? 0) + 1
  seen.set(key, count)
  if (count === 1) return `${prefix}-${key}`
  return `${prefix}-${key}-${count}`
}
