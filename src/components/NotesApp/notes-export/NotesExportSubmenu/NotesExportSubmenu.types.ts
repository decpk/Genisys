import type { ExportSubject } from '../notes-export.types'

export interface NotesExportSubmenuProps {
  /** What to export — usually a `kind: 'container'` subject from the sidebar tree. */
  subject: ExportSubject
  /** Submenu trigger label. Defaults to `'Export'`. */
  label?: string
}
