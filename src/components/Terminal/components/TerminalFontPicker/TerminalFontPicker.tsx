import { ChevronDown, Type } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useTerminalFontPickerData } from './useTerminalFontPickerData'

export function TerminalFontPicker() {
  const data = useTerminalFontPickerData()
  const currentLabel = data.fontConfig[data.terminalFont].label

  return (
    <DropdownMenu>
      <Tooltip content={`Font: ${currentLabel}`}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 h-6 px-1.5 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors max-w-[120px]"
            aria-label={`Terminal font: ${currentLabel}`}
          >
            <Type className="w-3 h-3 shrink-0" />
            <span className="truncate">{currentLabel}</span>
            <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
          </button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-50 min-w-[180px] max-h-[min(360px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {data.options.map((opt) => {
          const isActive = data.terminalFont === opt.value
          const itemClass = isActive
            ? 'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors bg-primary/10 text-primary font-medium'
            : 'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors text-foreground/80 hover:bg-secondary'
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => data.setTerminalFont(opt.value)}
              className={itemClass}
            >
              <span style={{ fontFamily: data.fontConfig[opt.value].family }}>{opt.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
