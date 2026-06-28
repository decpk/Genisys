import { cn } from '@/lib/utils'
import type { DummyDataCategoryItemProps } from './DummyDataCategoryItem.types'

export function DummyDataCategoryItem(props: DummyDataCategoryItemProps) {
  const { category, isSelected, onSelect } = props

  const handleClick = () => onSelect(category.id)

  const stateClass = isSelected
    ? 'border-primary/50 bg-primary/10'
    : 'border-transparent hover:border-border/40 hover:bg-accent'

  const className = cn(
    'flex flex-col items-start gap-0.5 rounded-md border px-2.5 py-1.5 text-left transition-colors',
    stateClass
  )

  return (
    <button type="button" onClick={handleClick} className={className}>
      <span className="text-sm font-medium text-foreground">{category.name}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {category.description}
      </span>
    </button>
  )
}
