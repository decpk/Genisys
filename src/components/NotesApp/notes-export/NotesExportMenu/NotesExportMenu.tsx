import { ChevronDown, Download, FileDown } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { notesExportMenuStyles as styles } from './NotesExportMenu.styles'
import type { NotesExportMenuProps } from './NotesExportMenu.types'
import { useNotesExportMenuData } from './useNotesExportMenuData'

/**
 * Toolbar dropdown that lets the user export the current `subject`
 * (a single note or a container) as PDF / HTML / any other format
 * registered with the shared Library `exportRegistry`.
 *
 * Renders nothing when no formats are registered.
 */
export function NotesExportMenu(props: NotesExportMenuProps): React.JSX.Element | null {
  const { subject, variant = 'button-with-label', tooltip = 'Export' } = props
  const { formats, isExporting, handleSelectFormat } = useNotesExportMenuData(subject)

  if (formats.length === 0) return null

  // Glyph shown inside the trigger — spinner while exporting, download
  // icon otherwise. Extracted to a variable to honour the
  // "no ternaries in JSX" rule.
  let triggerGlyph: React.JSX.Element
  if (isExporting) {
    triggerGlyph = <AppLoaderGlyph size={13} />
  } else {
    triggerGlyph = <Download size={13} />
  }

  // Two trigger styles. Computed before the return so the JSX stays
  // flat (no inline ternaries) and we can wrap it once in <Tooltip>.
  let triggerElement: React.JSX.Element
  if (variant === 'icon') {
    triggerElement = (
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        disabled={isExporting}
        aria-label={tooltip}
      >
        {triggerGlyph}
      </IconButton>
    )
  } else {
    triggerElement = (
      <Button
        type="button"
        variant="outline"
        size="xs"
        disabled={isExporting}
      >
        {triggerGlyph}
        <span>Export</span>
        <ChevronDown size={10} />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <Tooltip content={tooltip} side="bottom">
        <DropdownMenuTrigger asChild>{triggerElement}</DropdownMenuTrigger>
      </Tooltip>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={styles.content}
      >
        {formats.map((format) => {
          // Optional description row — extracted out of JSX to avoid
          // an inline ternary on the truthiness of `format.description`.
          let descriptionNode: React.JSX.Element | null = null
          if (format.description) {
            descriptionNode = <span className={styles.itemDescription}>{format.description}</span>
          }
          return (
            <DropdownMenuItem
              key={format.id}
              disabled={isExporting}
              onSelect={() => handleSelectFormat(format.id)}
              className={styles.item}
            >
              <FileDown size={13} className="shrink-0" />
              <div className={styles.itemTextStack}>
                <span>{format.label}</span>
                {descriptionNode}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
