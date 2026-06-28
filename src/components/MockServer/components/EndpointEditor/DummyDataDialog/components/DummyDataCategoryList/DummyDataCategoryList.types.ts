import type { DummyDataCategory } from '@/components/MockServer/components/EndpointEditor/dummy-data'

export interface DummyDataCategoryListProps {
  /** Section heading shown above the items. */
  title: string
  /** Categories to render in this section. */
  categories: DummyDataCategory[]
  /** Currently selected category id, if any. */
  selectedId: string | null
  /** Called with the category id when an item is chosen. */
  onSelect: (id: string) => void
}
