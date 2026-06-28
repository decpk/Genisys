import { GitPullRequestArrow, CircleCheckBig, CircleX, CircleDashed } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatusIconResult {
  icon: LucideIcon
  className: string
}

export function getStatusIcon(status: string): StatusIconResult {
  switch (status) {
    case 'active':
      return { icon: GitPullRequestArrow, className: 'text-blue-400' }
    case 'completed':
      return { icon: CircleCheckBig, className: 'text-emerald-400' }
    case 'abandoned':
      return { icon: CircleX, className: 'text-red-400' }
    default:
      return { icon: CircleDashed, className: 'text-zinc-500' }
  }
}
