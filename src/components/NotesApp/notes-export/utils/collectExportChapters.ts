import type { CollectedExport, ExportSubject } from '../notes-export.types'
import { collectFromContainer } from './collectFromContainer'
import { collectFromSingleNote } from './collectFromSingleNote'
import { lookupNoteById } from './lookupNoteById'
import { resolveSubjectBookTitle } from './resolveSubjectBookTitle'

/**
 * Turn an `ExportSubject` into a fully-built `CollectedExport` payload
 * ready to be handed to one of the Library exporters (PDF / HTML / …).
 *
 * Thin dispatcher — delegates the real work to two focused builders:
 *
 * - `collectFromSingleNote` for `{ kind: 'note', note }`
 *   (or `{ kind: 'container', node }` where the node itself is a note)
 * - `collectFromContainer`  for any other `{ kind: 'container', node }`
 *
 * For a container the result is one chapter per descendant note (in
 * display order), with chapter titles prefixed by the breadcrumb of
 * intermediate ancestors (sections / topics / nested notebooks) so
 * the exported document preserves the original hierarchy.
 *
 * Notes with empty content are skipped and surfaced via `skippedTitles`
 * so the caller can warn the user.
 */
export function collectExportChapters(subject: ExportSubject): CollectedExport {
  if (subject.kind === 'note') {
    return collectFromSingleNote(subject.note)
  }

  // The sidebar context menu only has a `TreeNode` — when that node
  // is itself a note (not a container), redirect to the single-note
  // path by looking up the underlying `Note` from the store.
  if (subject.node.type === 'note') {
    const note = lookupNoteById(subject.node.id)
    if (note) return collectFromSingleNote(note)
    // Note id was in the tree but not in any loaded scope — surface
    // it as a single skipped item so the user gets a useful toast.
    const fallbackTitle = resolveSubjectBookTitle(subject)
    return {
      bookTitle: fallbackTitle,
      chapters: [],
      skippedTitles: [fallbackTitle],
    }
  }

  return collectFromContainer(subject)
}
