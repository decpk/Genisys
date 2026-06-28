export type ReplaceContentResult = { content: string; count: number } | { error: string }

/** Find and replace literal text inside chapter content. */
export function replaceContentText(
  content: string,
  search: string,
  replace: string,
  all: boolean,
): ReplaceContentResult {
  if (search.length === 0) {
    return { error: 'search must not be empty.' }
  }

  const parts = content.split(search)
  const occurrences = parts.length - 1
  if (occurrences === 0) {
    const snippet = search.length > 60 ? search.slice(0, 60) : search
    return { error: `Text "${snippet}" not found in chapter.` }
  }

  if (all) {
    return { content: parts.join(replace), count: occurrences }
  }

  const index = content.indexOf(search)
  const nextContent = content.slice(0, index) + replace + content.slice(index + search.length)
  return { content: nextContent, count: 1 }
}
