import { Download, FileDown } from 'lucide-react'

import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu'

import { notesExportSubmenuStyles as styles } from './NotesExportSubmenu.styles'
import type { NotesExportSubmenuProps } from './NotesExportSubmenu.types'
import { useNotesExportSubmenuData } from './useNotesExportSubmenuData'

/**
 * Nested `Export ▸` submenu, designed to be dropped directly inside an
 * existing `<ContextMenuContent>` block (e.g. inside the notes tree's
 * context menu for project / notebook / section / topic / note rows).
 *
 * Lists every format registered with the Library `exportRegistry`,
 * and runs the export via the shared `useNotesExport` hook.
 *
 * Renders nothing when no formats are registered.
 */
export function NotesExportSubmenu(props: NotesExportSubmenuProps): React.JSX.Element | null {
  const { subject, label = 'Export' } = props
  const { formats, isExporting, handleSelectFormat } = useNotesExportSubmenuData(subject)

  if (formats.length === 0) return null

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Download size={15} />
        {label}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {formats.map((format) => {
          // Optional secondary description — extracted to avoid an
          // inline ternary inside JSX.
          let descriptionNode: React.JSX.Element | null = null
          if (format.description) {
            descriptionNode = (
              <span className={styles.itemDescription}>{format.description}</span>
            )
          }
          return (
            <ContextMenuItem
              key={format.id}
              disabled={isExporting}
              onSelect={() => handleSelectFormat(format.id)}
            >
              <FileDown size={15} />
              <div className={styles.itemTextStack}>
                <span>{format.label}</span>
                {descriptionNode}
              </div>
            </ContextMenuItem>
          )
        })}
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}
