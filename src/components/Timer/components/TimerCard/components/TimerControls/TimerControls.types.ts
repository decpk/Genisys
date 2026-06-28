export type TimerControlsVariant = 'inline' | 'stacked'

export interface TimerControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  variant?: TimerControlsVariant
  showPrimaryLabel?: boolean
  accentColor?: string
}
