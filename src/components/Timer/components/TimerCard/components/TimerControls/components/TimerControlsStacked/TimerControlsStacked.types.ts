export interface TimerControlsStackedProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  accentColor?: string
}
