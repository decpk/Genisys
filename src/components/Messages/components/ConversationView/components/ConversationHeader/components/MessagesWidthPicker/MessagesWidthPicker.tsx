import { ChevronDown, Columns2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { CONTENT_WIDTH_OPTIONS, getContentWidthLabel } from '@/lib/content-width'

import type { MessagesWidthPickerProps } from './MessagesWidthPicker.types'

export function MessagesWidthPicker(props: MessagesWidthPickerProps): React.JSX.Element {
  const { contentWidth, onContentWidthChange } = props

  return (
    <DropdownMenu>
      <Tooltip content="Content width" side="bottom">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            aria-label="Content width"
          >
            <Columns2 className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">{getContentWidthLabel(contentWidth)}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </button>
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
