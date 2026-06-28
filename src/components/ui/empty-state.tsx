import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  message: string
  icon?: LucideIcon
  iconSize?: number
  className?: string
  action?: React.ReactNode
}

export function EmptyState({
  message,
  icon: Icon,
  iconSize = 28,
  className = 'py-16',
  action
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {Icon && <Icon size={iconSize} className="text-muted-foreground/30 mb-2" />}
      <p className="text-xs text-muted-foreground">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
