import type { AppView } from '@/components/ActivityBar'

export interface AppSwitcherCandidate {
  /** The app view this tile represents. */
  mode: AppView
  /** Icon component for the app. */
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>
  /** Display label for the app. */
  label: string
}
