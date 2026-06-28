import { useRef, useMemo } from 'react'
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useSettingsStore } from '@/store/settings-store'

import { useExplorerActivateItem } from '../../hooks/useExplorerActivateItem'
import { useExplorerKeyboardNav } from '../../hooks/useExplorerKeyboardNav'
import { DetailedRow } from './DetailedRow'
import { DetailedTableHeader } from './DetailedTableHeader'
import { LOCAL_COLUMNS } from './DetailedView.columns'
import { CurrentFolderContextSpacer } from './CurrentFolderContextSpacer'
import { useSortedItems } from './useSortedItems'
import type { ViewModeComponentProps } from './ViewModes.types'

function noopActivePath() {}

export function DetailedView(props: ViewModeComponentProps): React.JSX.Element {
  const {
    items,
    currentPath,
    sort,
    source,
    rootPath,
    onOpenFolder,
    onOpenFile,
    onFileHistory,
    onChanged,
    onSortChange,
    activePath,
    onActivePathChange,
    onGoUp
  } = props
  const mixFoldersWithFiles = useSettingsStore((s) => s.explorerMixFoldersWithFiles)
  const sorted = useSortedItems(items, sort, mixFoldersWithFiles)
  const columns = useMemo(() => LOCAL_COLUMNS, [])
  const scrollRef = useRef<HTMLDivElement>(null)

  const table = useReactTable({
    data: sorted,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange'
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
    overscan: 20
  })

  const totalWidth = table.getTotalSize()

  const onActivate = useExplorerActivateItem({ onOpenFolder, onOpenFile })
  const { activeIndex } = useExplorerKeyboardNav({
    items: sorted,
    scrollRef,
    virtualizer: rowVirtualizer,
    columns: 1,
    activePath: activePath ?? null,
    onActivePathChange: onActivePathChange ?? noopActivePath,
    onActivate,
    onGoUp
  })

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div
        ref={scrollRef}
        tabIndex={-1}
        className="overflow-auto flex-1 outline-none"
        style={{ contain: 'layout paint' }}
      >
        <div style={{ minWidth: totalWidth }}>
          <DetailedTableHeader table={table} sort={sort} onSortChange={onSortChange} />
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const isActive = virtualRow.index === activeIndex
              return (
                <DetailedRow
                  key={row.id}
                  row={row}
                  isActive={isActive}
                  source={source}
                  rootPath={rootPath}
                  onOpenFolder={onOpenFolder}
                  onOpenFile={onOpenFile}
                  onActivePathChange={onActivePathChange}
                  onFileHistory={onFileHistory}
                  onChanged={onChanged}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`
                  }}
                  measureRef={rowVirtualizer.measureElement}
                  virtualIndex={virtualRow.index}
                />
              )
            })}
          </div>
          <CurrentFolderContextSpacer
            currentPath={currentPath}
            source={source}
            rootPath={rootPath}
            onFileHistory={onFileHistory}
            onChanged={onChanged}
          />
        </div>
      </div>
    </div>
  )
}
