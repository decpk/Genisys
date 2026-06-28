import type { ExportChapter } from '@/components/Library/book-export'
import type { Note } from '@/store/notes-store'

import type { CollectedExport } from '../notes-export.types'
import { buildBreadcrumbTitle } from './buildBreadcrumbTitle'
import { isNoteContentEmpty } from './isNoteContentEmpty'
import { resolveSubjectBookTitle } from './resolveSubjectBookTitle'

/**
 * Build a `CollectedExport` payload for a single note.
 *
 * Produces exactly one chapter when the note has content; otherwise
 * returns no chapters and reports the note as skipped so the caller
 * can warn the user.
 */
export function collectFromSingleNote(note: Note): CollectedExport {
  const bookTitle = resolveSubjectBookTitle({ kind: 'note', note })

  if (isNoteContentEmpty(note.content)) {
    return {
      bookTitle,
      chapters: [],
      skippedTitles: [bookTitle],
    }
  }

  const chapter: ExportChapter = {
    chapterNumber: 1,
    title: buildBreadcrumbTitle([], note.title),
    content: note.content,
  }

  return {
    bookTitle,
    chapters: [chapter],
    skippedTitles: [],
  }
}
