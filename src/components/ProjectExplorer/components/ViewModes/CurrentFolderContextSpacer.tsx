import { useMemo } from 'react'

import type { RepoItem } from '../../ProjectExplorer.types'
import { ExplorerContextMenu } from '../ExplorerContextMenu'

interface CurrentFolderContextSpacerProps {
  currentPath: string
  source?: 'local'
  rootPath?: string
  onFileHistory?: (path: string) => void
  onChanged?: () => void
  className?: string
}

export function CurrentFolderContextSpacer({
  currentPath,
  source,
  rootPath,
  onFileHistory,
  onChanged,
  className = 'h-[400px] w-full'
}: CurrentFolderContextSpacerProps): React.JSX.Element {
  const folderItem = useMemo<RepoItem>(
    () => ({
      objectId: '__current-folder__',
      gitObjectType: 'tree',
      commitId: '',
      path: currentPath,
      isFolder: true,
      url: ''
    }),
    [currentPath]
  )

  return (
    <ExplorerContextMenu
      item={folderItem}
      isLocal={source === 'local'}
      rootPath={rootPath}
      onFileHistory={onFileHistory}
      onChanged={onChanged}
    >
      <div className={className} />
    </ExplorerContextMenu>
  )
}
