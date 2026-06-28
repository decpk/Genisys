import { memo } from 'react'
import { flexRender } from '@tanstack/react-table'
import type { Row } from '@tanstack/react-table'
import { Cloud } from 'lucide-react'

import { getFileIcon } from '@/lib/file-icons'
import { useSettingsStore } from '@/store/settings-store'

import type { RepoItem } from '../../ProjectExplorer.types'
import { useExplorerRowOpenHandlers } from '../../hooks/useExplorerRowOpenHandlers'
import { getHiddenFileOpacity } from '../../utils/getHiddenFileOpacity'
import { isICloudPlaceholder } from '../../utils/isICloudPlaceholder'
import { ExplorerContextMenu } from '../ExplorerContextMenu'
import { ItemInfoDialog } from '../ItemInfoDialog'

interface DetailedRowProps {
  row: Row<RepoItem>
  isActive: boolean
  source?: 'local'
  rootPath?: string
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, objectId: string) => void
  onActivePathChange?: (path: string) => void
  onFileHistory?: (path: string) => void
  onChanged?: () => void
  style?: React.CSSProperties
  measureRef?: (el: HTMLElement | null) => void
  virtualIndex?: number
}

export const DetailedRow = memo(function DetailedRow(props: DetailedRowProps): React.JSX.Element {
  const {
    row,
    isActive,
    source,
    rootPath,
    onOpenFolder,
    onOpenFile,
    onActivePathChange,
    onFileHistory,
    onChanged,
    style,
    measureRef,
    virtualIndex
  } = props
  const showHidden = useSettingsStore((s) => s.explorerShowHidden)
  const dimHidden = useSettingsStore((s) => s.explorerDimHiddenFiles)
  const item = row.original
  const name = item.path.split('/').pop() ?? item.path
  const isIcloud = !item.isFolder && isICloudPlaceholder(name)
  const opacity = getHiddenFileOpacity(name, showHidden, dimHidden)
  const rowStyle: React.CSSProperties =
    opacity === 1 ? (style ?? {}) : { ...(style ?? {}), opacity }
  const { onClick: handleClick, onDoubleClick: handleDoubleClick, cursorClass } = useExplorerRowOpenHandlers({
    item,
    onOpenFolder,
    onOpenFile,
    onActivePathChange
  })

  return (
    <ExplorerContextMenu
      item={item}
      isLocal={source === 'local'}
      rootPath={rootPath}
      onFileHistory={onFileHistory}
      onChanged={onChanged}
    >
      <div
        ref={measureRef}
        data-index={virtualIndex}
        data-active={isActive ? 'true' : undefined}
        aria-selected={isActive}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            item.isFolder ? onOpenFolder(item.path) : onOpenFile(item.path, item.objectId)
          }
        }}
        className={`flex items-center group text-sm text-left transition-colors ${cursorClass} border border-transparent hover:bg-secondary/70 text-foreground w-full data-[active=true]:bg-primary/10 data-[active=true]:border-primary/30 data-[active=true]:text-primary`}
        style={rowStyle}
      >
        {row.getVisibleCells().map((cell) => {
          if (cell.column.id === 'icon') {
            return (
              <div key={cell.id} className="flex items-center justify-center pl-4 pr-1 relative" style={{ width: cell.column.getSize() }}>
                <span className="relative inline-flex">
                  {getFileIcon(name, item.isFolder)}
                  {isIcloud && (
                    <Cloud
                      size={8}
                      className="absolute -bottom-0.5 -right-0.5 text-sky-400 bg-background rounded-full"
                    />
                  )}
                </span>
              </div>
            )
          }
          if (cell.column.id === 'actions') {
            return (
              <div key={cell.id} className="flex items-center justify-center" style={{ width: cell.column.getSize() }}>
                <ItemInfoDialog item={item} />
              </div>
            )
          }
          if (cell.column.id === 'name') {
            return (
              <div
                key={cell.id}
                className="truncate font-normal px-2 flex-1 min-w-0"
                style={{ minWidth: cell.column.getSize() }}
              >
                {name}
              </div>
            )
          }
          const isRightAligned = cell.column.id === 'modified' || cell.column.id === 'size'
          return (
            <div
              key={cell.id}
              className={
                'text-xs text-muted-foreground truncate px-2 tabular-nums ' +
                (isRightAligned ? 'text-right' : '')
              }
              style={{ width: cell.column.getSize() }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          )
        })}
      </div>
    </ExplorerContextMenu>
  )
})
