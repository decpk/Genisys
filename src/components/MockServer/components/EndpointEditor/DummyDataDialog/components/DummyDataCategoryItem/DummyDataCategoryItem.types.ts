import type { DummyDataCategory } from '@/components/MockServer/components/EndpointEditor/dummy-data'

export interface DummyDataCategoryItemProps {
  /** The category this row represents. */
  category: DummyDataCategory
  /** Whether this row is the active selection. */
  isSelected: boolean
  /** Called with the category id when the row is clicked. */
  onSelect: (id: string) => void
}
