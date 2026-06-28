import { DummyDataCategoryItem } from '../DummyDataCategoryItem'
import type { DummyDataCategoryListProps } from './DummyDataCategoryList.types'

export function DummyDataCategoryList(props: DummyDataCategoryListProps) {
  const { title, categories, selectedId, onSelect } = props

  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      <div className="flex flex-col gap-1">
        {categories.map((category) => (
          <DummyDataCategoryItem
            key={category.id}
            category={category}
            isSelected={category.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
