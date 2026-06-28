import { ChevronDown, ALargeSmall } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useTerminalFontSizePickerData } from './useTerminalFontSizePickerData'

export function TerminalFontSizePicker() {
  const data = useTerminalFontSizePickerData()

  return (
    <DropdownMenu>
      <Tooltip content={`Font size: ${data.fontSize}px`}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 h-6 px-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
            aria-label={`Terminal font size: ${data.fontSize}px`}
          >
            <ALargeSmall className="w-3 h-3 shrink-0" />
            <span className="tabular-nums">{data.fontSize}</span>
            <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
          </button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-50 min-w-[100px] max-h-[min(360px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {data.options.map((size) => {
          const isActive = data.fontSize === size
          const itemClass = isActive
            ? 'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors bg-primary/10 text-primary font-medium'
            : 'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors text-foreground/80 hover:bg-secondary'
          return (
            <DropdownMenuItem
              key={size}
              onSelect={() => data.setFontSize(size)}
              className={itemClass}
            >
              <span className="tabular-nums">{size}</span>
              <span className="text-[10px] text-muted-foreground">px</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
