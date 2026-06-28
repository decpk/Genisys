import type { LucideIcon } from 'lucide-react'

interface PanelHeadingProps {
  icon: LucideIcon
  title: string
  count?: number
  iconClassName?: string
  className?: string
  children?: React.ReactNode
}

export function PanelHeading({
  icon: Icon,
  title,
  count,
  iconClassName = 'text-muted-foreground',
  className = 'px-3 h-12 border-b border-border/40',
  children
}: PanelHeadingProps): React.JSX.Element {
  return (
    <div className={`shrink-0 flex items-center gap-2 ${className}`}>
      <Icon size={14} className={iconClassName} />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
          {count}
        </span>
      )}
      {children && (
        <div className="ml-auto flex items-center gap-1">
          {children}
        </div>
      )}
    </div>
  )
}
