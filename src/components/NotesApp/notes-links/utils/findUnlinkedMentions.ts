import type { Note } from '@/store/notes-store'
import { normalizeNoteTitle } from './normalizeNoteTitle'
import { parseWikiLinks } from './parseWikiLinks'
import { extractMentionSnippet } from './extractMentionSnippet'
import type { NoteRef } from '../notes-links.types'

/**
 * Find notes that mention `targetTitle` as plain text but do NOT already link
 * to it via a `[[...]]` token — candidates the user may want to link.
 */
export function findUnlinkedMentions(
  notes: Note[],
  targetId: string,
  targetTitle: string,
): NoteRef[] {
  const title = targetTitle.trim()
  if (!title) return []
  const normTitle = normalizeNoteTitle(title)
  const result: NoteRef[] = []

  for (const note of notes) {
    if (note.id === targetId) continue
    const content = note.content ?? ''
    if (!content.toLowerCase().includes(normTitle)) continue

    const alreadyLinks = parseWikiLinks(content).some(
      (label) => normalizeNoteTitle(label) === normTitle,
    )
    if (alreadyLinks) continue

    result.push({
      noteId: note.id,
      title: note.title.trim() || 'Untitled',
      snippet: extractMentionSnippet(content, title),
    })
  }

  return result
}
