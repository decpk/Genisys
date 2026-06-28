import { ArrowUpDown, Filter } from 'lucide-react'

import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { Button } from '@/components/ui/button'
import type { NotesSidebarFilter, NotesSidebarSort } from '@/store/notes-app-store'

import { notesSidebarStyles as styles } from '../NotesSidebar.styles'

interface QuickActionsBarProps {
  filter: NotesSidebarFilter
  sort: NotesSidebarSort
  onFilterChange: (filter: NotesSidebarFilter) => void
  onSortChange: (sort: NotesSidebarSort) => void
}

const FILTER_OPTIONS: Array<{ key: NotesSidebarFilter; label: string }> = [
  { key: 'all', label: 'All notes' },
  { key: 'notebooks', label: 'In notebooks' },
  { key: 'unsorted', label: 'Unsorted' },
  { key: 'pinned', label: 'Pinned' },
]

const SORT_OPTIONS: Array<{ key: NotesSidebarSort; label: string }> = [
  { key: 'updated-desc', label: 'Recently updated' },
  { key: 'updated-asc', label: 'Oldest updated' },
  { key: 'created-desc', label: 'Recently created' },
  { key: 'created-asc', label: 'Oldest created' },
  { key: 'title-asc', label: 'Title (A-Z)' },
  { key: 'title-desc', label: 'Title (Z-A)' },
]

export function QuickActionsBar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: QuickActionsBarProps): React.JSX.Element {
  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.key === filter)?.label ?? 'All notes'
  const activeSortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Recently updated'

  const filterItems: DropdownItem[] = FILTER_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    active: option.key === filter,
    onSelect: () => onFilterChange(option.key),
  }))

  const sortItems: DropdownItem[] = SORT_OPTIONS.map((option) => ({
    key: option.key,
    label: option.label,
    active: option.key === sort,
    onSelect: () => onSortChange(option.key),
  }))

  return (
    <div className={styles.filterRow}>
      <Dropdown
        openOn="click"
        items={filterItems}
        align="left"
        menuWidth="200px"
        trigger={
          <Button variant="ghost" size="xs" className={styles.filterButton} title="Filter">
            <Filter size={11} />
            <span className="truncate max-w-[90px]">{activeFilterLabel}</span>
          </Button>
        }
      />

      <Dropdown
        openOn="click"
        items={sortItems}
        align="left"
        menuWidth="200px"
        trigger={
          <Button variant="ghost" size="xs" className={styles.filterButton} title="Sort">
            <ArrowUpDown size={11} />
            <span className="truncate max-w-[110px]">{activeSortLabel}</span>
          </Button>
        }
      />
    </div>
  )
}
