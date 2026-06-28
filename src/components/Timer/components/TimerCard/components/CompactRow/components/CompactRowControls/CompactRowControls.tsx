import { MoreHorizontal, RotateCcw, SkipForward, Trash2 } from 'lucide-react'
import { useState } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconButton } from '@/components/ui/icon-button'
import { ShortcutTooltip } from '@/frameworks/shortcut-tooltip'

import { PrimaryActionIcon } from '../../../TimerControls/components/PrimaryActionIcon'
import { getPrimaryLabel } from '../../../TimerControls/utils/getPrimaryLabel'

import type { CompactRowControlsProps } from './CompactRowControls.types'

const ROOT_CLASS =
  'flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity'

export function CompactRowControls(props: CompactRowControlsProps): React.JSX.Element {
  const { isRunning, onStart, onPause, onReset, onSkip, onRemove, accentColor } = props
  const primaryLabel = getPrimaryLabel(isRunning)
  const onPrimary = isRunning ? onPause : onStart
  const primaryStyle: React.CSSProperties = accentColor
    ? { backgroundColor: accentColor, color: '#fff' }
    : {}
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className={ROOT_CLASS}>
      <ShortcutTooltip content="Reset" shortcutId="timer.reset">
        <IconButton variant="ghost" size="sm" onClick={onReset} aria-label="Reset">
          <RotateCcw size={14} />
        </IconButton>
      </ShortcutTooltip>
      <ShortcutTooltip content={primaryLabel} shortcutId="timer.startPause">
        <IconButton
          variant="default"
          size="sm"
          onClick={onPrimary}
          aria-label={primaryLabel}
          style={primaryStyle}
        >
          <PrimaryActionIcon isRunning={isRunning} size={14} />
        </IconButton>
      </ShortcutTooltip>
      <ShortcutTooltip content="Skip" shortcutId="timer.skip">
        <IconButton variant="ghost" size="sm" onClick={onSkip} aria-label="Skip">
          <SkipForward size={14} />
        </IconButton>
      </ShortcutTooltip>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <IconButton variant="ghost" size="sm" tooltip="More" tooltipDisabled={menuOpen}>
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
  )
}
