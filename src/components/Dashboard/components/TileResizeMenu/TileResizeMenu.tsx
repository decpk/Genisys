import { useState } from 'react'
import { Check, Maximize2 } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { TILE_WIDTH_OPTIONS } from '../../registry/tile-widths.constants'
import type { TileResizeMenuProps } from './TileResizeMenu.types'

/**
 * Shared dashboard tile resize control. Renders a radix `DropdownMenu` that
 * opens on click (replacing the previous hover-triggered dropdown). The active
 * width is marked with a trailing check.
 */
export function TileResizeMenu({
  tileWidth,
  onWidthChange,
  iconSize = 14,
  tooltipLabel = 'Resize',
  align = 'end',
}: TileResizeMenuProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <IconButton
          size="xs"
          tooltip={tooltipLabel}
          tooltipSide="bottom"
          tooltipDisabled={open}
        >
          <Maximize2 size={iconSize} />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {TILE_WIDTH_OPTIONS.map((option) => {
          const Icon = option.icon
          const active = tileWidth === option.value
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onWidthChange(option.value)}
            >
              <Icon className="opacity-70" />
              <span className="flex-1">{option.label}</span>
              {active && <Check className="text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
