import { MousePointerClick } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MainEmptyStateProps {
  icon: LucideIcon
  title: string
  description?: React.ReactNode
  hint?: string
  className?: string
  children?: React.ReactNode
}

export function MainEmptyState({
  icon: Icon,
  title,
  description,
  hint,
  className = '',
  children
}: MainEmptyStateProps): React.JSX.Element {
  return (
    <div className={`flex flex-col items-center justify-center flex-1 h-full select-none ${className}`}>
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-breathe" />
        <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon size={28} className="text-primary" />
        </div>
      </div>

      <h2 className="text-sm font-semibold text-foreground mb-1">{title}</h2>
      {description && (
        <p className="text-xs text-muted-foreground text-center max-w-xs">{description}</p>
      )}
      {hint && (
        <div className="flex items-center gap-1.5 text-[10px] text-primary/60 mt-3">
          <MousePointerClick size={12} />
          <span>{hint}</span>
        </div>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
