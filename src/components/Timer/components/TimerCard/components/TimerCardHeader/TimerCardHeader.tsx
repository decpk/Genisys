import { MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton } from '@/components/ui/icon-button'

import { TimerRunningDot } from './components/TimerRunningDot'
import type { TimerCardHeaderProps } from './TimerCardHeader.types'

export function TimerCardHeader(props: TimerCardHeaderProps): React.JSX.Element {
  const { instance, onRemove, accentColor, isRunning, rightSlot } = props
  const showDot = Boolean(isRunning && accentColor)
  const dotNode = showDot ? <TimerRunningDot color={accentColor as string} /> : null
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {dotNode}
        <span className="text-sm font-medium truncate">{instance.name}</span>
        <span className="text-[10px] uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
          {instance.mode}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {rightSlot}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <IconButton variant="ghost" size="xs" tooltip="More" tooltipDisabled={menuOpen}>
              <MoreHorizontal size={14} />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onRemove} className="text-destructive focus:text-destructive">
              <Trash2 size={14} className="text-destructive" />
              <span className="ml-2">Remove</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
