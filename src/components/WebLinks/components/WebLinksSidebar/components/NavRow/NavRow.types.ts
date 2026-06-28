import type { LucideIcon } from 'lucide-react'

/** Props for a static sidebar nav row ("All" / "Unfiled"). */
export interface NavRowProps {
  /** Leading icon component. */
  icon: LucideIcon
  /** Row label. */
  label: string
  /** Preview count badge. */
  count: number
  /** Whether this row is the active selection. */
  isActive: boolean
  /** Select this row. */
  onClick: () => void
}
