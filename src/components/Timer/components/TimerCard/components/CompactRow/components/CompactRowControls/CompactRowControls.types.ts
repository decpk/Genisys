export interface CompactRowControlsProps {
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onRemove: () => void
  accentColor?: string
}
