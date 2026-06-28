import type { Note } from '@/store/notes-store'
import { normalizeNoteTitle } from './normalizeNoteTitle'
import { parseWikiLinks } from './parseWikiLinks'
import type { NotesLinkEdge, NotesLinkGraph } from '../notes-links.types'

/**
 * Derive the full wiki-link adjacency graph from a set of notes by scanning
 * each note's markdown for `[[Title]]` tokens and resolving them to note ids
 * via title. Self-links and duplicate edges are ignored.
 */
export function buildNotesLinkGraph(notes: Note[]): NotesLinkGraph {
  const titleToId: Record<string, string> = {}
  for (const note of notes) {
    const norm = normalizeNoteTitle(note.title)
    if (norm && !(norm in titleToId)) titleToId[norm] = note.id
  }

  const forward: Record<string, string[]> = {}
  const backward: Record<string, string[]> = {}
  const edges: NotesLinkEdge[] = []
  const seen = new Set<string>()

  for (const note of notes) {
    const labels = parseWikiLinks(note.content)
    for (const label of labels) {
      const targetId = titleToId[normalizeNoteTitle(label)]
      if (!targetId || targetId === note.id) continue
      const key = `${note.id}->${targetId}`
      if (seen.has(key)) continue
      seen.add(key)
      ;(forward[note.id] ??= []).push(targetId)
      ;(backward[targetId] ??= []).push(note.id)
      edges.push({ source: note.id, target: targetId })
    }
  }

  return { forward, backward, edges, titleToId }
}
