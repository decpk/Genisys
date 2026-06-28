import type { Note } from '@/store/notes-store'
import type { ExportChapter } from '@/components/Library/book-export'

import type { TreeNode } from '../components/NotesSidebar/useNotesSidebarData'

/**
 * Discriminated union describing what the user wants to export.
 *
 * - `note`   — a single `Note` (e.g. clicked from the toolbar of the open note)
 * - `container` — a `TreeNode` for a project / notebook / section / topic
 *                 (or any node whose descendants are notes)
 */
export type ExportSubject =
  | { kind: 'note'; note: Note }
  | { kind: 'container'; node: TreeNode }

/**
 * Result of walking an `ExportSubject` and collecting its descendant
 * notes into a flat, ordered list of chapters suitable for the
 * Library exporters.
 */
export interface CollectedExport {
  bookTitle: string
  bookDescription?: string
  chapters: ExportChapter[]
  /** Notes that were skipped because their content was empty. */
  skippedTitles: string[]
}
