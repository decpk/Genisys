/**
 * Resolves an operation's folder path from its tags: `[firstTag]` when a
 * non-empty first tag exists, otherwise `[]` (request lives at root).
 */
export function resolveFolderPath(tags: string[] | undefined): string[] {
  const firstTag = tags?.[0]
  if (typeof firstTag === 'string' && firstTag.length > 0) return [firstTag]
  return []
}
