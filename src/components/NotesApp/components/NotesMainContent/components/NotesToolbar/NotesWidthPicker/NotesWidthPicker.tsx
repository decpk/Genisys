import { ChevronDown, Columns2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { CONTENT_WIDTH_OPTIONS, getContentWidthLabel } from '@/lib/content-width'

import { notesMainContentStyles as styles } from '../../../NotesMainContent.styles'
import type { NotesWidthPickerProps } from './NotesWidthPicker.types'

export function NotesWidthPicker(props: NotesWidthPickerProps): React.JSX.Element {
  const { contentWidth, onContentWidthChange, isCompact } = props

  return (
    <DropdownMenu>
      <Tooltip content="Content width" side="bottom">
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn(styles.toolbarBtn, 'px-2 gap-1', styles.toolbarBtnIdle)}>
            <Columns2 size={12} />
            {!isCompact && <span>{getContentWidthLabel(contentWidth)}</span>}
            <ChevronDown size={10} className="opacity-50" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-50 min-w-[120px] rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {CONTENT_WIDTH_OPTIONS.map((option) => {
          const itemClass = cn(
            'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors',
            contentWidth === option.value
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-foreground/80 hover:bg-secondary',
          )
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onContentWidthChange(option.value)}
              className={itemClass}
            >
              {option.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
