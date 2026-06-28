import type { WikiLinkSuggestion } from '@/frameworks/wysiwyg-editor/extensions/wiki-link'
import { getAllNotes } from './getAllNotes'

const MAX_RESULTS = 20

/** Search titled notes by case-insensitive substring for the `[[` popup. */
export function searchNotesByTitle(query: string): WikiLinkSuggestion[] {
  const q = query.trim().toLowerCase()
  const titled = getAllNotes().filter((n) => n.title.trim().length > 0)
  const matched = q
    ? titled.filter((n) => n.title.toLowerCase().includes(q))
    : titled
  return matched.slice(0, MAX_RESULTS).map((n) => ({ id: n.id, title: n.title }))
}
