import { Folder } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { getBaseName } from '../../utils/getBaseName'
import { FolderTreeNode } from './FolderTreeNode'
import type { MoveCopyDialogProps } from './MoveCopyDialog.types'
import { useMoveCopyDialogData } from './useMoveCopyDialogData'

export function MoveCopyDialog(props: MoveCopyDialogProps): React.JSX.Element {
  const { open, onOpenChange, mode, itemPath, rootPath } = props
  const {
    selectedPath,
    rootFolders,
    isPending,
    loading,
    disabledPath,
    isValid,
    handleSelect,
    handleSelectRoot,
    handleConfirm
  } = useMoveCopyDialogData(props)

  const title = mode === 'move' ? 'Move to…' : 'Copy to…'
  const itemName = getBaseName(itemPath)
  const destination = selectedPath ? (selectedPath === '/' ? '/' : selectedPath) : '—'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-2">
          {mode === 'move' ? 'Moving' : 'Copying'} <strong>{itemName}</strong> to{' '}
          <code className="text-foreground">{destination}</code>
        </p>
        <div className="border rounded-md max-h-[300px] overflow-y-auto p-1">
          <button
            type="button"
            onClick={handleSelectRoot}
            className={cn(
              'flex items-center gap-1.5 w-full px-2 py-1 text-sm text-left rounded transition-colors',
              selectedPath === '/' && 'bg-primary/10 text-primary',
              selectedPath !== '/' && 'hover:bg-secondary/70 cursor-pointer'
            )}
          >
            <Folder className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">/</span>
          </button>
          {loading && (
            <p className="text-xs text-muted-foreground px-2 py-2">Loading…</p>
          )}
          {rootFolders.map((folder) => (
            <FolderTreeNode
              key={folder.path}
              item={folder}
              rootPath={rootPath}
              selectedPath={selectedPath}
              disabledPath={disabledPath}
              depth={1}
              onSelect={handleSelect}
            />
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isPending}>
            {isPending && <AppLoaderGlyph size={16} />}
            {mode === 'move' ? 'Move' : 'Copy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
