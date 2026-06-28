import { CircularTimerRing } from '../../../CircularTimerRing'
import { LinkedTaskChip } from '../LinkedTaskChip'
import { PhaseDots } from '../PhaseDots'
import { TimerControls } from '../TimerControls'

import { FocusStatusPill } from './components/FocusStatusPill'
import { FocusTitle } from './components/FocusTitle'
import {
  FOCUS_RING_SIZE,
  FOCUS_RING_STROKE,
  FOCUS_ROOT_CLASS,
} from './FocusCardLayout.styles'
import type { FocusCardLayoutProps } from './FocusCardLayout.types'
import { getFocusPhaseLabel } from './utils/getFocusPhaseLabel'

export function FocusCardLayout(props: FocusCardLayoutProps): React.JSX.Element {
  const {
    instance,
    ringColor,
    progress,
    centerLabel,
    isRunning,
    onStart,
    onPause,
    onReset,
    onSkip,
  } = props

  const phaseLabel = getFocusPhaseLabel(instance.phase)
  const isPomodoro = instance.mode === 'pomodoro'
  const phaseDots = isPomodoro ? (
    <PhaseDots
      total={instance.sessionsBeforeLongBreak}
      filled={instance.completedSessionsInCycle}
      color={ringColor}
    />
  ) : null
  const taskChip = instance.dailyPlanTaskId ? (
    <LinkedTaskChip taskId={instance.dailyPlanTaskId} />
  ) : null

  return (
    <div className={FOCUS_ROOT_CLASS}>
      <FocusStatusPill label={phaseLabel} color={ringColor} isRunning={isRunning} />
      <FocusTitle name={instance.name} mode={instance.mode} />
      <CircularTimerRing
        size={FOCUS_RING_SIZE}
        strokeWidth={FOCUS_RING_STROKE}
        progress={progress}
        colorRing={ringColor}
        gradient
        glow={isRunning}
        glowIntensity="strong"
        breathing={isRunning}
        tintedTrack
        centerLabel={centerLabel}
      />
      {phaseDots}
      <TimerControls
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onSkip={onSkip}
        variant="stacked"
        accentColor={ringColor}
      />
      {taskChip}
    </div>
  )
}
