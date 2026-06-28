import { memo, useRef } from 'react'
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
import { CurrentFolderContextSpacer } from './CurrentFolderContextSpacer'
import { useSortedItems } from './useSortedItems'
import type { ViewModeComponentProps } from './ViewModes.types'

const ROW_HEIGHT = 22
const OVERSCAN = 20

function noopActivePath() {}

export function CompactView(props: ViewModeComponentProps): React.JSX.Element {
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

  const rowVirtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN
  })

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
    <div
      ref={scrollRef}
      tabIndex={-1}
      className="overflow-y-auto flex-1 outline-none"
      style={{ contain: 'strict' }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = sorted[virtualRow.index]
          return (
            <CompactRow
              key={item.path}
              item={item}
              index={virtualRow.index}
              isActive={virtualRow.index === activeIndex}
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
  )
}

interface CompactRowProps {
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
  style?: React.CSSProperties
}

const CompactRow = memo(function CompactRow(props: CompactRowProps): React.JSX.Element {
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
    onChanged,
    style
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
  const isIcloud = !item.isFolder && isICloudPlaceholder(name)
  const opacity = getHiddenFileOpacity(name, showHidden, dimHidden)
  const rowStyle: React.CSSProperties =
    opacity === 1 ? (style ?? {}) : { ...(style ?? {}), opacity }
  return (
    <div style={rowStyle}>
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
          className={`flex items-center gap-1.5 px-2 py-0.5 text-xs text-left font-normal transition-colors ${cursorClass} border border-transparent hover:bg-secondary/70 text-foreground w-full h-full data-[active=true]:bg-primary/10 data-[active=true]:border-primary/30 data-[active=true]:text-primary`}
        >
          <span className="shrink-0 relative">
            {getFileIcon(name, item.isFolder, 12)}
            {isIcloud && (
              <Cloud
                size={8}
                className="absolute -bottom-0.5 -right-0.5 text-sky-400 bg-background rounded-full"
              />
            )}
          </span>
          <span className="truncate flex-1">{name}</span>
        </button>
      </ExplorerContextMenu>
    </div>
  )
})
