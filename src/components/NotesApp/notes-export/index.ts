/**
 * Public surface of the Notes export feature.
 *
 * Two integration points:
 *
 * - `NotesExportMenu`     → toolbar dropdown (single-note exports from the editor)
 * - `NotesExportSubmenu`  → nested context-menu item (container exports from the sidebar tree)
 *
 * Both ride on the shared `useNotesExport` hook, which delegates the
 * actual conversion to the Library `exportRegistry` (PDF / HTML / …).
 */

export { NotesExportMenu } from './NotesExportMenu'
export type { NotesExportMenuProps, NotesExportMenuVariant } from './NotesExportMenu'

export { NotesExportSubmenu } from './NotesExportSubmenu'
export type { NotesExportSubmenuProps } from './NotesExportSubmenu'

export { useNotesExport } from './useNotesExport'
export type { UseNotesExportResult } from './useNotesExport'

export type { ExportSubject, CollectedExport } from './notes-export.types'
