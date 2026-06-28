import type { WikiLinkMenuItem, WikiLinkSuggestion } from '../WikiLinkExtension.types'

const MAX_RESULTS = 8

/**
 * Build the rows for the `[[` autocomplete popup: matching documents first,
 * plus a trailing "Create …" row when the query is non-empty and does not
 * exactly match an existing title.
 */
export function buildWikiLinkItems(
  query: string,
  search: (query: string) => WikiLinkSuggestion[],
): WikiLinkMenuItem[] {
  const trimmed = query.trim()
  const matches = search(trimmed)
    .slice(0, MAX_RESULTS)
    .map((s) => ({ id: s.id, title: s.title, isCreate: false }))

  if (!trimmed) return matches

  const hasExact = matches.some(
    (m) => m.title.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (hasExact) return matches

  return [...matches, { id: '__create__', title: trimmed, isCreate: true }]
}
