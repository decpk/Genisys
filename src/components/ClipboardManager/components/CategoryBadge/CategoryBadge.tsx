import { cn } from '@/lib/utils'
import { SMART_COLLECTION_CONFIGS, SMART_COLLECTION_ICON_MAP } from '../../utils/smart-collections'
import { CATEGORY_BADGE_COLORS } from './CategoryBadge.styles'
import type { CategoryBadgeProps } from './CategoryBadge.types'

export function CategoryBadge(props: CategoryBadgeProps): React.JSX.Element {
  const { category } = props
  const config = SMART_COLLECTION_CONFIGS[category]
  const colorClass = CATEGORY_BADGE_COLORS[category] || 'text-muted-foreground bg-muted border-border/20'
  const Icon = SMART_COLLECTION_ICON_MAP[config.icon as keyof typeof SMART_COLLECTION_ICON_MAP]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
        colorClass
      )}
    >
      {Icon && <Icon size={10} />}
      {config.label}
    </span>
  )
}
