import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import type { SortField, SortConfig } from './ViewModes/ViewModes.types'

interface ExplorerSortSwitcherProps {
  sort: SortConfig
  onSortChange: (sort: SortConfig) => void
  source?: 'local'
}

const COMMON_SORT_OPTIONS: { field: SortField; label: string; description: string }[] = [
  { field: 'name', label: 'Name', description: 'Sort alphabetically by file or folder name' },
  {
    field: 'extension',
    label: 'Extension',
    description: 'Group by file extension (.ts, .json, .tsx, etc.)'
  },
  {
    field: 'path',
    label: 'Full Path',
    description: 'Sort by the complete file path including directories'
  }
]


const LOCAL_SORT_OPTIONS: { field: SortField; label: string; description: string }[] = [
  {
    field: 'size',
    label: 'Size',
    description: 'Sort by file size \u2014 smallest or largest first'
  },
  {
    field: 'modified',
    label: 'Modified',
    description: 'Sort by last modified date \u2014 newest or oldest first'
  }
]

export function ExplorerSortSwitcher({
  sort,
  onSortChange
}: ExplorerSortSwitcherProps): React.JSX.Element {
  const extraOptions = LOCAL_SORT_OPTIONS
  const sortOptions = [...COMMON_SORT_OPTIONS, ...extraOptions]
  const activeLabel = sortOptions.find((o) => o.field === sort.field)?.label ?? 'Name'
  const DirIcon = sort.direction === 'asc' ? ArrowUp : ArrowDown

  const selectField = (field: SortField): void => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ field, direction: 'asc' })
    }
  }

  const items: DropdownItem[] = sortOptions.map(({ field, label, description }) => ({
    key: field,
    label,
    description,
    active: sort.field === field,
    endIcon: sort.field === field ? DirIcon : undefined,
    onSelect: () => selectField(field),
  }))

  return (
    <Dropdown
      openOn="click"
      items={items}
      align="right"
      menuWidth="288px"
      trigger={
        <button className="flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors cursor-pointer text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ArrowUpDown size={12} />
          <span>{activeLabel}</span>
          <DirIcon size={10} />
        </button>
      }
    />
  )
}
