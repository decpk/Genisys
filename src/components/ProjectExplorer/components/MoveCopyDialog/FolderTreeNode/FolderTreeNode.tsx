import { useState, useCallback } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { RepoItem } from '../../../../ProjectExplorer.types'
import { getBaseName } from '../../../utils/getBaseName'
import { loadFolderChildren } from '../api/loadFolderChildren'
import type { FolderTreeNodeProps } from './FolderTreeNode.types'

export function FolderTreeNode(props: FolderTreeNodeProps): React.JSX.Element {
  const { item, rootPath, selectedPath, disabledPath, depth, onSelect } = props
  const [expanded, setExpanded] = useState(false)
  const [children, setChildren] = useState<RepoItem[] | null>(null)
  const [loading, setLoading] = useState(false)

  const isSelected = selectedPath === item.path
  const isDisabled = disabledPath !== null && item.path.startsWith(disabledPath)
  const name = getBaseName(item.path)

  const handleToggle = useCallback(async () => {
    if (isDisabled) return
    if (!expanded && children === null) {
      setLoading(true)
      const loaded = await loadFolderChildren(rootPath, item.path)
      setChildren(loaded)
      setLoading(false)
    }
    setExpanded((v) => !v)
  }, [expanded, children, rootPath, item.path, isDisabled])

  const handleSelect = useCallback(() => {
    if (isDisabled) return
    onSelect(item.path)
  }, [item.path, onSelect, isDisabled])

  const FolderIcon = expanded ? FolderOpen : Folder

  return (
    <div>
      <button
        type="button"
        onClick={handleSelect}
        onDoubleClick={handleToggle}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-1.5 w-full px-2 py-1 text-sm text-left rounded transition-colors',
          isSelected && 'bg-primary/10 text-primary',
          isDisabled && 'opacity-40 cursor-not-allowed',
          !isSelected && !isDisabled && 'hover:bg-secondary/70 cursor-pointer'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
          className="shrink-0 p-0.5 rounded hover:bg-secondary"
          tabIndex={-1}
        >
          <ChevronRight
            className={cn('size-3.5 transition-transform', expanded && 'rotate-90')}
          />
        </button>
        <FolderIcon className="size-4 text-muted-foreground shrink-0" />
        <span className="truncate">{name}</span>
      </button>
      {expanded && children && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderTreeNode
              key={child.path}
              item={child}
              rootPath={rootPath}
              selectedPath={selectedPath}
              disabledPath={disabledPath}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
      {expanded && loading && (
        <p className="text-xs text-muted-foreground" style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}>
          Loading…
        </p>
      )}
    </div>
  )
}
