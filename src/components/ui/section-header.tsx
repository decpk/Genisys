import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
  icon: LucideIcon
  title: string
  count?: number
  iconClassName?: string
  className?: string
}

export function SectionHeader({
  icon: Icon,
  title,
  count,
  iconClassName = 'text-muted-foreground',
  className = ''
}: SectionHeaderProps): React.JSX.Element {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon size={14} className={iconClassName} />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
        {count !== undefined && ` · ${count}`}
      </span>
    </div>
  )
}
