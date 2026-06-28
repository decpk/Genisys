import type { RepoItem } from '../ProjectExplorer.types'
import { EmptyFolderState } from './EmptyFolderState'
import type { ViewMode, SortConfig } from './ViewModes/ViewModes.types'
import { VIEW_MODE_REGISTRY } from './ViewModes'

interface FolderContentsProps {
  items: RepoItem[]
  currentPath: string
  viewMode: ViewMode
  sort: SortConfig
  source?: 'local'
  rootPath?: string
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, objectId: string) => void
  onFileHistory?: (path: string) => void
  onChanged?: () => void
  onSortChange?: (sort: SortConfig) => void
  activePath?: string | null
  onActivePathChange?: (path: string | null) => void
  onGoUp?: () => void
  originalItemsCount?: number
  onClearFilters?: () => void
}

export function FolderContents(props: FolderContentsProps): React.JSX.Element {
  const {
    items,
    currentPath,
    viewMode,
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
    onGoUp,
    originalItemsCount,
    onClearFilters
  } = props
  const ViewComponent = VIEW_MODE_REGISTRY[viewMode]

  if (items.length === 0) {
    const baseCount = originalItemsCount ?? 0
    let variant: 'empty' | 'no-matches' = 'empty'
    if (baseCount > 0) variant = 'no-matches'
    return <EmptyFolderState variant={variant} onClearFilters={onClearFilters} />
  }

  return (
    <ViewComponent
      items={items}
      currentPath={currentPath}
      sort={sort}
      source={source}
      rootPath={rootPath}
      onOpenFolder={onOpenFolder}
      onOpenFile={onOpenFile}
      onFileHistory={onFileHistory}
      onChanged={onChanged}
      onSortChange={onSortChange}
      activePath={activePath}
      onActivePathChange={onActivePathChange}
      onGoUp={onGoUp}
    />
  )
}
