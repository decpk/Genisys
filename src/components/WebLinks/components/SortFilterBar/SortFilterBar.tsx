import { Search, ArrowUp, ArrowDown, ArrowDownUp, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { STYLES } from './SortFilterBar.styles'
import { useSortFilterBarData } from './useSortFilterBarData'

/** Sticky toolbar: free-text filter, sort-key menu, and direction toggle. */
export function SortFilterBar(): React.JSX.Element {
  const {
    filterQuery,
    sortKey,
    sortLabel,
    isAscending,
    onFilterChange,
    onSortDateAdded,
    onSortTitle,
    onSortSiteName,
    onToggleDirection,
  } = useSortFilterBarData()

  let directionIcon = <ArrowDown size={16} />
  let directionTooltip = 'Sort descending'
  if (isAscending) {
    directionIcon = <ArrowUp size={16} />
    directionTooltip = 'Sort ascending'
  }

  const dateCheck = sortKey === 'dateAdded' ? <Check size={14} /> : null
  const titleCheck = sortKey === 'title' ? <Check size={14} /> : null
  const siteCheck = sortKey === 'siteName' ? <Check size={14} /> : null

  return (
    <div className={STYLES.bar}>
      <div className={STYLES.searchWrap}>
        <Search size={15} className={STYLES.searchIcon} />
        <input
          className={STYLES.input}
          value={filterQuery}
          onChange={onFilterChange}
          placeholder="Filter saved previews…"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            <ArrowDownUp size={14} />
            {sortLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onSortDateAdded}>
            {dateCheck}
            Date added
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSortTitle}>
            {titleCheck}
            Title
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSortSiteName}>
            {siteCheck}
            Site name
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <IconButton
        type="button"
        size="md"
        variant="outlined"
        tooltip={directionTooltip}
        onClick={onToggleDirection}
      >
        {directionIcon}
      </IconButton>
    </div>
  )
}
