import { memo, useRef, useState, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Cloud } from 'lucide-react'

import { getFileIcon } from '@/lib/file-icons'
import { useSettingsStore } from '@/store/settings-store'

import type { RepoItem } from '../../ProjectExplorer.types'
import { useExplorerActivateItem } from '../../hooks/useExplorerActivateItem'
import { useExplorerKeyboardNav } from '../../hooks/useExplorerKeyboardNav'
import { useExplorerRowOpenHandlers } from '../../hooks/useExplorerRowOpenHandlers'
import { getHiddenFileOpacity } from '../../utils/getHiddenFileOpacity'
import { isICloudPlaceholder } from '../../utils/isICloudPlaceholder'
import { ExplorerContextMenu } from '../ExplorerContextMenu'
import { ItemInfoDialog } from '../ItemInfoDialog'
import { CurrentFolderContextSpacer } from './CurrentFolderContextSpacer'
import { ExtPill } from './ExtPill'
import { getExtension } from './formatters'
import { useSortedItems } from './useSortedItems'
import type { ViewModeComponentProps } from './ViewModes.types'

const CARD_WIDTH = 160
const CARD_HEIGHT = 140
const GAP = 12
const PADDING = 12
const OVERSCAN = 3

function noopActivePath() {}

export function ThumbnailView(props: ViewModeComponentProps): React.JSX.Element {
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
    activePath,
    onActivePathChange,
    onGoUp
  } = props
  const mixFoldersWithFiles = useSettingsStore((s) => s.explorerMixFoldersWithFiles)
  const sorted = useSortedItems(items, sort, mixFoldersWithFiles)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(3)

  const updateColumns = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const available = el.clientWidth - PADDING * 2 + GAP
    const cols = Math.max(1, Math.floor(available / (CARD_WIDTH + GAP)))
    setColumns(cols)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateColumns()
    const observer = new ResizeObserver(updateColumns)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateColumns])

  const rowCount = Math.ceil(sorted.length / columns)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: OVERSCAN
  })

  const onActivate = useExplorerActivateItem({ onOpenFolder, onOpenFile })
  const { activeIndex } = useExplorerKeyboardNav({
    items: sorted,
    scrollRef,
    virtualizer: rowVirtualizer,
    columns,
    activePath: activePath ?? null,
    onActivePathChange: onActivePathChange ?? noopActivePath,
    onActivate,
    onGoUp
  })

  return (
    <div
      ref={scrollRef}
      tabIndex={-1}
      className="overflow-y-auto flex-1 outline-none"
      style={{ contain: 'strict' }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize() + PADDING * 2, position: 'relative', padding: PADDING }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const rowItems = sorted.slice(startIndex, startIndex + columns)
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: PADDING,
                right: PADDING,
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'flex',
                gap: GAP
              }}
            >
              {rowItems.map((item, colIdx) => {
                const itemIndex = startIndex + colIdx
                return (
                  <ThumbnailRow
                    key={item.path}
                    item={item}
                    index={itemIndex}
                    isActive={itemIndex === activeIndex}
                    source={source}
                    rootPath={rootPath}
                    onOpenFolder={onOpenFolder}
                    onOpenFile={onOpenFile}
                    onActivePathChange={onActivePathChange}
                    onFileHistory={onFileHistory}
                    onChanged={onChanged}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
      <CurrentFolderContextSpacer
        currentPath={currentPath}
        source={source}
        rootPath={rootPath}
        onFileHistory={onFileHistory}
        onChanged={onChanged}
        className="basis-full h-[400px]"
      />
    </div>
  )
}

interface ThumbnailRowProps {
  item: RepoItem
  index: number
  isActive: boolean
  source?: 'local'
  rootPath?: string
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, objectId: string) => void
  onActivePathChange?: (path: string) => void
  onFileHistory?: (path: string) => void
  onChanged?: () => void
}

const ThumbnailRow = memo(function ThumbnailRow(props: ThumbnailRowProps): React.JSX.Element {
  const {
    item,
    index,
    isActive,
    source,
    rootPath,
    onOpenFolder,
    onOpenFile,
    onActivePathChange,
    onFileHistory,
    onChanged
  } = props
  const showHidden = useSettingsStore((s) => s.explorerShowHidden)
  const dimHidden = useSettingsStore((s) => s.explorerDimHiddenFiles)
  const { onClick: handleClick, onDoubleClick: handleDoubleClick, cursorClass } = useExplorerRowOpenHandlers({
    item,
    onOpenFolder,
    onOpenFile,
    onActivePathChange
  })
  const name = item.path.split('/').pop() ?? item.path
  const ext = getExtension(name, item.isFolder)
  const isIcloud = !item.isFolder && isICloudPlaceholder(name)
  const opacity = getHiddenFileOpacity(name, showHidden, dimHidden)
  const buttonStyle: React.CSSProperties | undefined =
    opacity === 1 ? undefined : { opacity }
  return (
    <ExplorerContextMenu
      item={item}
      isLocal={source === 'local'}
      rootPath={rootPath}
      onFileHistory={onFileHistory}
      onChanged={onChanged}
    >
      <button
        data-index={index}
        data-active={isActive ? 'true' : undefined}
        aria-selected={isActive}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={buttonStyle}
        className={`group relative flex flex-col items-center gap-2 p-4 w-[160px] h-[140px] rounded-md text-foreground font-normal transition-colors ${cursorClass} ring-1 ring-border/0 hover:ring-border/60 hover:bg-secondary/40 data-[active=true]:bg-primary/10 data-[active=true]:ring-primary/30 data-[active=true]:text-primary`}
      >
        <span className="shrink-0 relative">
          {getFileIcon(name, item.isFolder, 48)}
          {isIcloud && (
            <Cloud
              size={14}
              className="absolute -bottom-0.5 -right-0.5 text-sky-400 bg-background rounded-full"
            />
          )}
        </span>
        <span className="text-sm w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
          {name}
        </span>
        {ext && <ExtPill ext={ext} size="sm" />}
        <span className="absolute top-1 right-1">
          <ItemInfoDialog item={item} />
        </span>
      </button>
    </ExplorerContextMenu>
  )
})
