import type { ExportSubject } from '../notes-export.types'

/**
 * Visual variant of the toolbar export trigger.
 *
 * - `icon`             — bare download icon, no label (compact toolbars).
 * - `button-with-label` — outlined button with `Export` label + chevron
 *                         (default, matches `BookExportMenu` styling).
 */
export type NotesExportMenuVariant = 'icon' | 'button-with-label'

export interface NotesExportMenuProps {
  /** What to export (single note or container). */
  subject: ExportSubject
  /** Trigger styling. Defaults to `'button-with-label'`. */
  variant?: NotesExportMenuVariant
  /** Optional tooltip text override. */
  tooltip?: string
}
