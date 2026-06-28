import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui/icon-button'
import { useTimerStore } from '@/store/timer-store'

import { computeRingProgress } from '../../../../utils/computeRingProgress'
import { formatTimerDisplay } from '../../../../utils/formatTimerDisplay'
import { getThemeById } from '../../../../utils/getThemeById'

import type { ActiveTimerRowProps } from './ActiveTimerRow.types'

const PHASE_LABELS: Record<string, string> = {
  idle: 'Idle',
  work: 'Work',
  'short-break': 'Break',
  'long-break': 'Long break',
  running: 'Running',
  paused: 'Paused',
  complete: 'Done',
}

export function ActiveTimerRow(props: ActiveTimerRowProps): React.JSX.Element {
  const { instance, isPrimary, onSelect, onRemove } = props
  const showProgressBg = useTimerStore((s) => s.settings.sidebarRowProgressBg)
  const theme = getThemeById(instance.themeId)
  const ringColor = theme?.ringColor ?? '#0ea5e9'
  const progress = computeRingProgress(instance)
  const progressPct = Math.round(progress * 100)
  const showRemaining = instance.mode !== 'stopwatch'
  const displaySec = showRemaining ? instance.remainingSec : instance.elapsedSec
  const phaseLabel = PHASE_LABELS[instance.phase] ?? instance.phase
  const dotPulse = instance.isRunning ? 'animate-pulse' : ''

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex flex-col gap-1.5 px-2.5 py-2 rounded-lg cursor-pointer overflow-hidden',
        'border transition-all duration-150',
        isPrimary
          ? 'border-border/70 bg-card shadow-sm'
          : 'border-transparent hover:border-border/40 hover:bg-card/60',
      )}
    >
      {/* Progress background fill (opt-in via settings) */}
      {showProgressBg && progressPct > 0 && (
        <span
          className="absolute inset-y-0 left-0 transition-[width] duration-500 pointer-events-none"
          style={{
            width: `${progressPct}%`,
            backgroundColor: ringColor,
            opacity: 0.12,
          }}
          aria-hidden
        />
      )}

      {/* Active accent bar */}
      {isPrimary && (
        <span
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
          style={{ backgroundColor: ringColor }}
          aria-hidden
        />
      )}

      {/* Header line */}
      <div className="relative flex items-center gap-2">
        <span
          className={cn('size-2 rounded-full shrink-0', dotPulse)}
          style={{ backgroundColor: ringColor }}
        />
        <span className={cn('flex-1 text-sm truncate', isPrimary ? 'font-medium text-foreground' : 'text-foreground/90')}>
          {instance.name}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
          {formatTimerDisplay(displaySec)}
        </span>
        <IconButton
          variant="ghost"
          size="xs"
          tooltip="Remove"
          onClick={handleRemove}
          className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={12} />
        </IconButton>
      </div>

      {/* Progress + phase (hidden when bg-fill mode is on, since bg already shows progress) */}
      {!showProgressBg && (
        <div className="relative flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-secondary/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: ringColor }}
            />
          </div>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80 shrink-0">
            {phaseLabel}
          </span>
        </div>
      )}
      {showProgressBg && (
        <div className="relative flex items-center justify-end">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/80">
            {phaseLabel}
          </span>
        </div>
      )}
    </div>
  )
}
