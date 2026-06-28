import { memo, Fragment } from 'react'
import { ChevronDown } from 'lucide-react'

import { MONOSPACE_FONT_OPTIONS } from '@/lib/fonts'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import type { TypographyFontFamilyPickerProps } from './TypographyFontFamilyPicker.types'
import { getFontLabel } from './utils/getFontLabel'
import { GROUP_LABELS } from './TypographyFontFamilyPicker.constants'

export const TypographyFontFamilyPicker = memo(function TypographyFontFamilyPicker(
  props: TypographyFontFamilyPickerProps
): React.JSX.Element {
  const { value, onChange } = props
  const label = getFontLabel(value)

  let lastGroup: string | null = null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors cursor-pointer border border-border/40">
          <span style={value ? { fontFamily: value } : undefined}>{label}</span>
          <ChevronDown size={12} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="z-50 min-w-[220px] max-h-[min(420px,var(--radix-dropdown-menu-content-available-height))] overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
      >
        {MONOSPACE_FONT_OPTIONS.map((opt) => {
          const isActive = opt.value === value
          const itemClass = isActive
            ? 'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors bg-primary/10 text-primary font-medium'
            : 'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] cursor-pointer outline-none transition-colors text-foreground/80 hover:bg-secondary'

          const showHeading = opt.group !== lastGroup
          lastGroup = opt.group
          const heading = showHeading ? GROUP_LABELS[opt.group] : null

          return (
            <Fragment key={opt.label}>
              {heading && (
                <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 select-none">
                  {heading}
                </div>
              )}
              <DropdownMenuItem
                onSelect={() => onChange(opt.value)}
                className={itemClass}
              >
                <span style={opt.value ? { fontFamily: opt.value } : undefined}>{opt.label}</span>
              </DropdownMenuItem>
            </Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
