import { memo } from 'react'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'

interface TimerTileControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
}

function ToggleIcon(props: { isRunning: boolean }): React.JSX.Element {
  if (props.isRunning) {
    return <Pause size={18} fill="currentColor" />
  }
  return <Play size={18} fill="currentColor" className="translate-x-[1px]" />
}

const SECONDARY_BTN_CLASS =
  'inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground border border-border/60 bg-card/40 hover:text-foreground hover:bg-secondary/60 hover:border-border active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'

export const TimerTileControls = memo(function TimerTileControls(
  props: TimerTileControlsProps,
): React.JSX.Element {
  const { isRunning, onStart, onPause, onReset, onSkip } = props
  const handleToggle = (): void => {
    if (isRunning) onPause()
    else onStart()
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-5">
      <Tooltip content="Reset" side="top">
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset timer"
          className={SECONDARY_BTN_CLASS}
        >
          <RotateCcw size={15} />
        </button>
      </Tooltip>
      <Tooltip content={isRunning ? 'Pause' : 'Start'} side="top">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ToggleIcon isRunning={isRunning} />
        </button>
      </Tooltip>
      <Tooltip content="Skip phase" side="top">
        <button
          type="button"
          onClick={onSkip}
          aria-label="Skip phase"
          className={SECONDARY_BTN_CLASS}
        >
          <SkipForward size={15} />
        </button>
      </Tooltip>
    </div>
  )
})
