import { ChevronDown, Languages } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { LANGUAGE_OPTIONS } from '@/lib/languages'
import { getLanguageLabel } from '@/lib/getLanguageLabel'

import type { LanguagePickerProps } from './LanguagePicker.types'

export function LanguagePicker(props: LanguagePickerProps): React.JSX.Element {
  const { value, onChange } = props
  const currentLabel = getLanguageLabel(value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 w-full rounded-md border border-border px-3 py-2 text-sm bg-card hover:bg-secondary/50 transition-colors cursor-pointer"
        >
          <Languages size={14} className="text-muted-foreground/70" />
          <span className="flex-1 text-left text-foreground">{currentLabel}</span>
          <ChevronDown size={12} className="text-muted-foreground/50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="z-[100] min-w-[240px] max-h-[300px] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {LANGUAGE_OPTIONS.map((opt) => {
          const isSelected = opt.value === value
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => onChange(opt.value)}
              className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] cursor-pointer outline-none transition-colors',
                isSelected
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-foreground/80 hover:bg-secondary',
              )}
            >
              {opt.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
