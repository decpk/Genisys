import { cn } from '@/lib/utils'

import { CircularTimerRing } from '../../../CircularTimerRing'
import { LinkedTaskChip } from '../LinkedTaskChip'
import { TimerCardHeader } from '../TimerCardHeader'
import { TimerControls } from '../TimerControls'

import { GridPrimaryBadge } from './components/GridPrimaryBadge'
import {
  GRID_BACKDROP_CLASS,
  GRID_FOOTER_CLASS,
  GRID_INNER_CLASS,
  GRID_RING_SIZE,
  GRID_RING_STROKE,
  GRID_RING_WRAP_CLASS,
  GRID_ROOT_BASE_CLASS,
  GRID_ROOT_DEFAULT_CLASS,
  GRID_ROOT_PRIMARY_CLASS,
} from './GridCardLayout.styles'
import type { GridCardLayoutProps } from './GridCardLayout.types'
import { buildGridBackdropStyle } from './utils/buildGridBackdropStyle'
import { buildGridRootStyle } from './utils/buildGridRootStyle'

function stopPropagation(event: React.MouseEvent): void {
  event.stopPropagation()
}

export function GridCardLayout(props: GridCardLayoutProps): React.JSX.Element {
  const {
    instance,
    ringColor,
    progress,
    centerLabel,
    isRunning,
    isPrimary,
    onStart,
    onPause,
    onReset,
    onSkip,
    onRemove,
    onPromote,
  } = props

  const rootClass = cn(
    GRID_ROOT_BASE_CLASS,
    isPrimary ? GRID_ROOT_PRIMARY_CLASS : GRID_ROOT_DEFAULT_CLASS,
  )
  const rootStyle = buildGridRootStyle(ringColor, isPrimary)
  const backdropStyle = buildGridBackdropStyle(ringColor, isPrimary)
  const primaryBadge = isPrimary ? <GridPrimaryBadge color={ringColor} /> : null
  const taskChip = instance.dailyPlanTaskId ? (
    <LinkedTaskChip taskId={instance.dailyPlanTaskId} />
  ) : null

  const handleClick = (): void => {
    if (isPrimary) return
    onPromote()
  }

  return (
    <div
      className={rootClass}
      style={rootStyle}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className={GRID_BACKDROP_CLASS} style={backdropStyle} aria-hidden />
      <div className={GRID_INNER_CLASS}>
        <TimerCardHeader
          instance={instance}
          onRemove={onRemove}
          accentColor={ringColor}
          isRunning={isRunning}
          rightSlot={primaryBadge}
        />
        <div className={GRID_RING_WRAP_CLASS} onClick={stopPropagation}>
          <CircularTimerRing
            size={GRID_RING_SIZE}
            strokeWidth={GRID_RING_STROKE}
            progress={progress}
            colorRing={ringColor}
            gradient
            glow={isRunning}
            glowIntensity="subtle"
            breathing={isRunning}
            tintedTrack
            centerLabel={centerLabel}
          />
        </div>
        <div className={GRID_FOOTER_CLASS} onClick={stopPropagation}>
          <div className="min-w-0 flex-1">{taskChip}</div>
          <TimerControls
            isRunning={isRunning}
            onStart={onStart}
            onPause={onPause}
            onReset={onReset}
            onSkip={onSkip}
            variant="inline"
            accentColor={ringColor}
          />
        </div>
      </div>
    </div>
  )
}
