import { memo } from 'react'
import { GripVertical, Timer } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import { TileResizeMenu } from '../TileResizeMenu'
import { TileHeading } from '../TileHeading'
import { TimerTileControls } from './components/TimerTileControls'
import { TimerTileDisplay } from './components/TimerTileDisplay'
import { TimerTileWeeklyBars } from './components/TimerTileWeeklyBars'
import { TIMER_TILE_PHASE_LABELS } from './TimerTile.constants'
import { useTimerTileData } from './useTimerTileData'
import { computeWeeklyTotal } from './utils/computeWeeklyTotal'
import type { TimerTileProps } from './TimerTile.types'

const PHASE_ACCENT: Record<string, string> = {
  work: 'text-primary',
  'short-break': 'text-emerald-500',
  'long-break': 'text-blue-500',
  idle: 'text-muted-foreground',
  running: 'text-primary',
  paused: 'text-muted-foreground',
  complete: 'text-emerald-500',
}

function getPhaseLabel(phase: string): string {
  const map = TIMER_TILE_PHASE_LABELS as Record<string, string>
  return map[phase] ?? 'Ready'
}

function getPhaseAccent(phase: string): string {
  return PHASE_ACCENT[phase] ?? 'text-muted-foreground'
}

export const TimerTile = memo(function TimerTile(
  props: TimerTileProps,
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const data = useTimerTileData()
  const {
    phase,
    remainingSec,
    isRunning,
    progress,
    ringColor,
    todaysCompletedSessions,
    todaysFocusMinutes,
    weeklyMinutes,
    start,
    pause,
    reset,
    skip,
  } = data

  const phaseLabel = getPhaseLabel(phase)
  const accent = getPhaseAccent(phase)
  const weeklyTotal = computeWeeklyTotal(weeklyMinutes)

  return (
    <div className="@container group relative border border-border rounded-xl bg-card overflow-hidden h-[400px] flex flex-col">
      {/* Ambient glow — tinted by the active ring color, intensifies while running */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          backgroundColor: ringColor,
          opacity: isRunning ? 0.18 : 0.08,
        }}
      />

      {/* Action buttons — top-right, shown on hover */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header — clickable, opens Timer app */}
      <TileHeading icon={Timer} title="Timer" appId="timer" appLabel="Open Timer" />

      {/* Body */}
      <div className="relative flex-1 min-h-0 flex flex-col p-4">
        <div className="flex flex-col items-center justify-center flex-1 min-h-0">
          <TimerTileDisplay
            seconds={remainingSec}
            phaseLabel={phaseLabel}
            accent={accent}
            progress={progress}
            ringColor={ringColor}
            isRunning={isRunning}
          />
          <TimerTileControls
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
          />
        </div>

        {/* Weekly activity bars */}
        <TimerTileWeeklyBars weeklyMinutes={weeklyMinutes} />
      </div>

      {/* Stats footer */}
      <div className="h-[42px] shrink-0 flex items-center justify-between px-4 border-t border-border/40 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="tabular-nums text-foreground font-semibold">
            {todaysCompletedSessions}
          </span>
          <span>sessions</span>
          <span className="text-border">·</span>
          <span className="tabular-nums text-foreground font-semibold">
            {todaysFocusMinutes}m
          </span>
          <span>today</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span>week</span>
          <span className="tabular-nums text-foreground font-semibold">
            {weeklyTotal}m
          </span>
        </span>
      </div>
    </div>
  )
})
