import type { LucideIcon } from 'lucide-react'

export interface AppStoreSidebarItemProps {
  icon?: LucideIcon
  /** Optional accent color (hex) used to tint the icon. */
  iconColor?: string
  label: string
  /** Optional trailing count badge (e.g. number of apps / installs). */
  count?: number
  active: boolean
  onClick: () => void
}
