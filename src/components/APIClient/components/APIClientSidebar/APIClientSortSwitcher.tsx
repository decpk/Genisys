import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import type { ApiClientSortField, ApiClientSortDirection } from '@/store/settings-store'

export interface ApiClientSortConfig {
  field: ApiClientSortField
  direction: ApiClientSortDirection
}

interface APIClientSortSwitcherProps {
  sort: ApiClientSortConfig
  onSortChange: (sort: ApiClientSortConfig) => void
}

const SORT_OPTIONS: { field: ApiClientSortField; label: string; description: string }[] = [
  { field: 'name', label: 'Name', description: 'Sort alphabetically by name' },
  { field: 'method', label: 'Method', description: 'Sort by HTTP method (requests only)' },
  { field: 'createdAt', label: 'Date Created', description: 'Sort by creation date' },
  { field: 'updatedAt', label: 'Date Updated', description: 'Sort by last modified date' },
]

export function APIClientSortSwitcher({
  sort,
  onSortChange,
}: APIClientSortSwitcherProps): React.JSX.Element {
  const activeLabel = SORT_OPTIONS.find((o) => o.field === sort.field)?.label ?? 'Date Created'
  const DirIcon = sort.direction === 'asc' ? ArrowUp : ArrowDown

  const selectField = (field: ApiClientSortField): void => {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ field, direction: 'asc' })
    }
  }

  const items: DropdownItem[] = SORT_OPTIONS.map(({ field, label, description }) => ({
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
