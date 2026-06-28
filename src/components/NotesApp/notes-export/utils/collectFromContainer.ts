import type { ExportChapter } from '@/components/Library/book-export'

import type { CollectedExport, ExportSubject } from '../notes-export.types'
import { buildBreadcrumbTitle } from './buildBreadcrumbTitle'
import { flattenTreeToNotes } from './flattenTreeToNotes'
import { isNoteContentEmpty } from './isNoteContentEmpty'
import { readNoteContentMap } from './readNoteContentMap'
import { resolveSubjectBookTitle } from './resolveSubjectBookTitle'
import { resolveSubjectDescription } from './resolveSubjectDescription'

type ContainerSubject = Extract<ExportSubject, { kind: 'container' }>

/**
 * Build a `CollectedExport` payload for a container subject (project,
 * notebook, section, topic, or `unsorted`).
 *
 * Walks the container's tree depth-first, turns each descendant note
 * into a chapter (in display order), and prefixes the chapter title
 * with the breadcrumb of intermediate containers so the exported
 * document preserves the original hierarchy.
 *
 * Notes with empty content are skipped and reported via `skippedTitles`.
 */
export function collectFromContainer(subject: ContainerSubject): CollectedExport {
  const flattened = flattenTreeToNotes(subject.node)
  const noteContentById = readNoteContentMap()

  const chapters: ExportChapter[] = []
  const skippedTitles: string[] = []

  for (const entry of flattened) {
    const content = noteContentById.get(entry.noteId) ?? ''
    const fullTitle = buildBreadcrumbTitle(entry.breadcrumbSegments, entry.noteTitle)

    if (isNoteContentEmpty(content)) {
      skippedTitles.push(fullTitle)
      continue
    }

    chapters.push({
      chapterNumber: chapters.length + 1,
      title: fullTitle,
      content,
    })
  }

  return {
    bookTitle: resolveSubjectBookTitle(subject),
    bookDescription: resolveSubjectDescription(subject, chapters.length),
    chapters,
    skippedTitles,
  }
}
