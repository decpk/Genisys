import { useMemo } from 'react'
import { File, Folder } from 'lucide-react'

import type { RepoItem } from '../ProjectExplorer.types'

interface ExplorerStatusBarProps {
  items: RepoItem[]
}

export function ExplorerStatusBar({ items }: ExplorerStatusBarProps): React.JSX.Element {
  const { files, folders } = useMemo(() => {
    let files = 0
    let folders = 0
    for (const item of items) {
      if (item.isFolder) folders++
      else files++
    }
    return { files, folders }
  }, [items])

  return (
    <div className="sticky bottom-0 flex items-center gap-3 px-3 py-1 text-xs text-muted-foreground bg-muted/50 border-t border-border/40 shrink-0">
      <span className="flex items-center gap-1">
        <Folder size={12} />
        {folders} {folders === 1 ? 'folder' : 'folders'}
      </span>
      <span className="flex items-center gap-1">
        <File size={12} />
        {files} {files === 1 ? 'file' : 'files'}
      </span>
    </div>
  )
}
