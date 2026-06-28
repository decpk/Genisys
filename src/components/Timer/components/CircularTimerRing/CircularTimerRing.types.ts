export interface CircularTimerRingProps {
  size: number
  strokeWidth: number
  progress: number
  colorRing: string
  colorTrack?: string
  pulse?: boolean
  centerLabel: string
  subLabel?: string
  gradient?: boolean
  colorRingAccent?: string
  glow?: boolean
  glowIntensity?: 'subtle' | 'strong'
  breathing?: boolean
  tintedTrack?: boolean
}
