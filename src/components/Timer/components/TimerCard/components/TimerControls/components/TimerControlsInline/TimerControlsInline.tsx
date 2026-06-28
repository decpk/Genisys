import { RotateCcw, SkipForward } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ShortcutTooltip } from '@/frameworks/shortcut-tooltip'

import { PrimaryActionIcon } from '../PrimaryActionIcon'
import { getPrimaryLabel } from '../../utils/getPrimaryLabel'

import type { TimerControlsInlineProps } from './TimerControlsInline.types'

export function TimerControlsInline(props: TimerControlsInlineProps): React.JSX.Element {
  const { isRunning, onStart, onPause, onReset, onSkip, showPrimaryLabel, accentColor } = props
  const primaryLabel = getPrimaryLabel(isRunning)
  const onPrimary = isRunning ? onPause : onStart
  const labelNode = showPrimaryLabel ? <span className="ml-1">{primaryLabel}</span> : null
  const primaryStyle: React.CSSProperties = accentColor
    ? { backgroundColor: accentColor, color: '#fff', borderColor: accentColor }
    : {}

  return (
    <div className="flex items-center justify-center gap-2">
      <ShortcutTooltip content="Reset" shortcutId="timer.reset">
        <Button variant="ghost" size="sm" onClick={onReset} aria-label="Reset">
          <RotateCcw size={16} />
        </Button>
      </ShortcutTooltip>
      <ShortcutTooltip content={primaryLabel} shortcutId="timer.startPause">
        <Button
          variant="default"
          size="sm"
          onClick={onPrimary}
          aria-label={primaryLabel}
          style={primaryStyle}
        >
          <PrimaryActionIcon isRunning={isRunning} size={16} />
          {labelNode}
        </Button>
      </ShortcutTooltip>
      <ShortcutTooltip content="Skip" shortcutId="timer.skip">
        <Button variant="ghost" size="sm" onClick={onSkip} aria-label="Skip">
          <SkipForward size={16} />
        </Button>
      </ShortcutTooltip>
    </div>
  )
}
