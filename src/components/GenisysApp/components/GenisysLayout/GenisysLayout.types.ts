import type { ActivityBarPosition } from '@/store/settings-store'

export interface GenisysLayoutProps {
  activityBarPosition: ActivityBarPosition
  activityBarEl: React.ReactNode
  mainContentEl: React.ReactNode
}
