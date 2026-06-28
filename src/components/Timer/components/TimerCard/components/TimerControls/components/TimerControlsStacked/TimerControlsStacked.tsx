import { RotateCcw, SkipForward } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { ShortcutTooltip } from '@/frameworks/shortcut-tooltip'

import { PrimaryActionIcon } from '../PrimaryActionIcon'
import { getPrimaryLabel } from '../../utils/getPrimaryLabel'

import type { TimerControlsStackedProps } from './TimerControlsStacked.types'

const PRIMARY_BTN_CLASS =
  'inline-flex items-center justify-center h-14 w-14 rounded-full text-primary-foreground shadow-lg transition-transform active:scale-95 hover:scale-[1.04]'

export function TimerControlsStacked(props: TimerControlsStackedProps): React.JSX.Element {
  const { isRunning, onStart, onPause, onReset, onSkip, accentColor } = props
  const primaryLabel = getPrimaryLabel(isRunning)
  const onPrimary = isRunning ? onPause : onStart
  const bg = accentColor ?? 'var(--color-primary)'

  return (
    <div className="flex items-center justify-center gap-5">
      <ShortcutTooltip content="Reset" shortcutId="timer.reset">
        <IconButton variant="ghost" size="md" onClick={onReset} aria-label="Reset">
          <RotateCcw size={18} />
        </IconButton>
      </ShortcutTooltip>
      <ShortcutTooltip content={primaryLabel} shortcutId="timer.startPause">
        <button
          type="button"
          onClick={onPrimary}
          aria-label={primaryLabel}
          className={PRIMARY_BTN_CLASS}
          style={{ backgroundColor: bg }}
        >
          <PrimaryActionIcon isRunning={isRunning} size={22} fill="currentColor" />
        </button>
      </ShortcutTooltip>
      <ShortcutTooltip content="Skip" shortcutId="timer.skip">
        <IconButton variant="ghost" size="md" onClick={onSkip} aria-label="Skip">
          <SkipForward size={18} />
        </IconButton>
      </ShortcutTooltip>
    </div>
  )
}
