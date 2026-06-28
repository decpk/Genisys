import { computeRingProgress } from '../../utils/computeRingProgress'
import { formatTimerDisplay } from '../../utils/formatTimerDisplay'
import { getThemeById } from '../../utils/getThemeById'

import { CompactRow } from './components/CompactRow'
import { FocusCardLayout } from './components/FocusCardLayout'
import { GridCardLayout } from './components/GridCardLayout'
import type { TimerCardProps } from './TimerCard.types'
import { useTimerCardData } from './useTimerCardData'

const DEFAULT_RING_COLOR = '#0ea5e9'

export function TimerCard(props: TimerCardProps): React.JSX.Element {
  const { instance, view } = props
  const { start, pause, reset, skip, remove, setPrimary, primaryId } = useTimerCardData()

  const theme = getThemeById(instance.themeId)
  const ringColor = theme?.ringColor ?? DEFAULT_RING_COLOR
  const progress = computeRingProgress(instance)
  const showRemaining = instance.mode !== 'stopwatch'
  const displaySec = showRemaining ? instance.remainingSec : instance.elapsedSec
  const center = formatTimerDisplay(displaySec)
  const isPrimary = primaryId === instance.id

  const handleRemove = (): void => remove(instance.id)
  const handleStart = (): void => start(instance.id)
  const handlePause = (): void => pause(instance.id)
  const handleReset = (): void => reset(instance.id)
  const handleSkip = (): void => skip(instance.id)
  const handlePromote = (): void => setPrimary(instance.id)

  if (view === 'compact') {
    return (
      <CompactRow
        instance={instance}
        ringColor={ringColor}
        progress={progress}
        centerLabel={center}
        isRunning={instance.isRunning}
        isPrimary={isPrimary}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSkip={handleSkip}
        onRemove={handleRemove}
        onPromote={handlePromote}
      />
    )
  }

  if (view === 'grid') {
    return (
      <GridCardLayout
        instance={instance}
        ringColor={ringColor}
        progress={progress}
        centerLabel={center}
        isRunning={instance.isRunning}
        isPrimary={isPrimary}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSkip={handleSkip}
        onRemove={handleRemove}
        onPromote={handlePromote}
      />
    )
  }

  return (
    <FocusCardLayout
      instance={instance}
      ringColor={ringColor}
      progress={progress}
      centerLabel={center}
      isRunning={instance.isRunning}
      onStart={handleStart}
      onPause={handlePause}
      onReset={handleReset}
      onSkip={handleSkip}
      onRemove={handleRemove}
    />
  )
}
