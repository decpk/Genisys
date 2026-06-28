import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface BacklinkSectionProps {
  title: string
  icon: LucideIcon
  count: number
  children: ReactNode
}
