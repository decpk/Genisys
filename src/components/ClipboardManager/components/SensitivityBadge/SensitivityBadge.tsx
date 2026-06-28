import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SENSITIVITY_CONFIGS } from '../../utils/sensitive-data'
import type { SensitivityBadgeProps } from './SensitivityBadge.types'

export function SensitivityBadge(props: SensitivityBadgeProps): React.JSX.Element | null {
  const { level, matchCount } = props

  if (level === 'none') return null

  const config = SENSITIVITY_CONFIGS[level]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
        config.bgColor,
        config.color,
        config.borderColor,
        level === 'critical' && 'animate-pulse'
      )}
      title={`${config.label} — ${matchCount} sensitive ${matchCount === 1 ? 'item' : 'items'} detected`}
    >
      <ShieldAlert size={10} />
      {config.label}
    </span>
  )
}
