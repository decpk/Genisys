import type { LucideIcon } from 'lucide-react'

export interface QuitConfirmMarqueeFeature {
  id: string
  icon: LucideIcon
  label: string
  tagline: string
}

export interface QuitConfirmLiveSignals {
  runningTimers: number
  clipboardCount: number
}
