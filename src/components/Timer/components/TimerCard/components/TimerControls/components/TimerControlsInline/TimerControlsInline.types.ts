export interface TimerControlsInlineProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  showPrimaryLabel?: boolean
  accentColor?: string
}
