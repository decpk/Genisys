import { flexRender } from '@tanstack/react-table'
import type { Table } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { RepoItem } from '../../ProjectExplorer.types'
import type { SortConfig } from './ViewModes.types'
import { COLUMN_TO_SORT_FIELD } from './utils/columnToSortField'
import { isColumnSortable } from './utils/isColumnSortable'
import { getNextSortConfig } from './utils/getNextSortConfig'

interface DetailedTableHeaderProps {
  table: Table<RepoItem>
  sort?: SortConfig
  onSortChange?: (sort: SortConfig) => void
}

export function DetailedTableHeader({ table, sort, onSortChange }: DetailedTableHeaderProps): React.JSX.Element {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border/40 shrink-0">
      {table.getHeaderGroups().map((headerGroup) => (
        <div key={headerGroup.id} className="flex">
          {headerGroup.headers.map((header) => {
            const isName = header.column.id === 'name'
            const isRightAligned = header.column.id === 'modified' || header.column.id === 'size'
            const isIcon = header.column.id === 'icon'
            const sortable = isColumnSortable(header.column.id)
            const sortField = COLUMN_TO_SORT_FIELD[header.column.id]
            const isActiveSort = sort && sortField === sort.field

            const handleClick = sortable && sort && onSortChange
              ? () => onSortChange(getNextSortConfig(sort, sortField))
              : undefined

            return (
              <div
                key={header.id}
                className={cn(
                  'relative py-2 px-2 text-[10px] uppercase tracking-wide font-medium text-muted-foreground/80 select-none truncate',
                  isName && 'flex-1 min-w-0',
                  isRightAligned && 'text-right',
                  isIcon && 'pl-4',
                  sortable && 'cursor-pointer hover:text-foreground transition-colors',
                  isActiveSort && 'text-foreground'
                )}
                style={isName ? { minWidth: header.getSize() } : { width: header.getSize() }}
                onClick={handleClick}
              >
                <span className={cn('inline-flex items-center gap-0.5', isRightAligned && 'justify-end w-full')}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  {isActiveSort && (
                    sort.direction === 'asc'
                      ? <ArrowUp size={10} className="shrink-0" />
                      : <ArrowDown size={10} className="shrink-0" />
                  )}
                </span>
                {header.column.getCanResize() && (
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={() => header.column.resetSize()}
                    className={cn(
                      "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                      "hover:bg-primary/40",
                      header.column.getIsResizing() && "bg-primary/60",
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  );
}
