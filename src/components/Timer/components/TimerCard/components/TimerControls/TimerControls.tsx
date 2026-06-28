import { TimerControlsInline } from './components/TimerControlsInline'
import { TimerControlsStacked } from './components/TimerControlsStacked'
import type { TimerControlsProps } from './TimerControls.types'

export function TimerControls(props: TimerControlsProps): React.JSX.Element {
  const {
    isRunning,
    onStart,
    onPause,
    onReset,
    onSkip,
    variant,
    showPrimaryLabel,
    accentColor,
  } = props
  const resolvedVariant = variant ?? 'inline'

  if (resolvedVariant === 'stacked') {
    return (
      <TimerControlsStacked
        isRunning={isRunning}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onSkip={onSkip}
        accentColor={accentColor}
      />
    )
  }

  return (
    <TimerControlsInline
      isRunning={isRunning}
      onStart={onStart}
      onPause={onPause}
      onReset={onReset}
      onSkip={onSkip}
      showPrimaryLabel={showPrimaryLabel}
      accentColor={accentColor}
    />
  )
}
