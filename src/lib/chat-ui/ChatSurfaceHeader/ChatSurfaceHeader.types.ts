import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface ChatSurfaceHeaderProps {
  /** Title text shown next to the icon. */
  title: string
  /** Optional lucide icon shown to the left of the title (defaults to `Sparkles`). */
  icon?: LucideIcon
  /** Optional render slot for trailing actions (new-chat button, width selector, …). */
  actions?: ReactNode
  /** Extra classes appended to the root header bar. */
  className?: string
}
