import type { LucideIcon } from 'lucide-react'

export interface AppStoreViewHeaderProps {
  /** Optional leading icon rendered in a tinted tile. */
  icon?: LucideIcon
  /** Accent color (hex) used to tint the icon tile. */
  accentColor?: string
  /** Main heading text. */
  title: string
  /** Optional supporting line under the title. */
  subtitle?: string
  /** Optional count shown as a pill next to the title. */
  count?: number
}
