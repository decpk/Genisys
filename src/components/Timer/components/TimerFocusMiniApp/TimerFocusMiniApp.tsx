import { Pause, Play, X } from 'lucide-react'

import { CircularTimerRing } from '@/components/Timer/components/CircularTimerRing'
import { computeRingProgress } from '@/components/Timer/utils/computeRingProgress'
import { formatTimerDisplay } from '@/components/Timer/utils/formatTimerDisplay'
import { getThemeById } from '@/components/Timer/utils/getThemeById'

import type { TimerFocusMiniAppProps } from './TimerFocusMiniApp.types'
import { useTimerFocusMiniAppData } from './useTimerFocusMiniAppData'

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex items-center justify-center h-full w-full text-xs text-muted-foreground">
      No active timer
    </div>
  )
}

interface PlayPauseButtonProps {
  isRunning: boolean
  onClick: () => void
}

function PlayPauseButton(props: PlayPauseButtonProps): React.JSX.Element {
  const { isRunning, onClick } = props
  const Icon = isRunning ? Pause : Play
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      aria-label={isRunning ? 'Pause' : 'Start'}
    >
      <Icon size={14} fill="currentColor" />
    </button>
  )
}

export function TimerFocusMiniApp(_props: TimerFocusMiniAppProps): React.JSX.Element {
  const data = useTimerFocusMiniAppData()
  const { primary, close, toggle } = data

  if (!primary) {
    return (
      <div className="h-screen w-screen rounded-2xl bg-background/85 backdrop-blur-md border border-border/40 p-4 flex flex-col">
        <Header onClose={close} />
        <EmptyState />
      </div>
    )
  }

  const theme = getThemeById(primary.themeId)
  const ringColor = theme?.ringColor ?? '#f59e0b'
  const progress = computeRingProgress(primary)
  const label = formatTimerDisplay(
    primary.mode === 'stopwatch' ? primary.elapsedSec : primary.remainingSec,
  )

  return (
    <div
      className="h-screen w-screen rounded-2xl bg-background/85 backdrop-blur-md border border-border/40 p-4 flex flex-col select-none"
      data-tauri-drag-region
    >
      <Header onClose={close} title={primary.name} />
      <div className="flex-1 flex items-center justify-center">
        <CircularTimerRing
          size={220}
          strokeWidth={10}
          progress={progress}
          colorRing={ringColor}
          centerLabel={label}
          pulse={primary.phase === 'complete'}
        />
      </div>
      <div className="flex items-center justify-center pt-2">
        <PlayPauseButton isRunning={primary.isRunning} onClick={toggle} />
      </div>
    </div>
  )
}

interface HeaderProps {
  onClose: () => void
  title?: string
}

function Header(props: HeaderProps): React.JSX.Element {
  const { onClose, title } = props
  return (
    <div
      className="flex items-center justify-between -mx-1 -mt-1 mb-1"
      data-tauri-drag-region
    >
      <span className="text-xs font-medium text-muted-foreground truncate px-1">
        {title ?? 'Timer'}
      </span>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        aria-label="Close mini timer"
      >
        <X size={12} />
      </button>
    </div>
  )
}
