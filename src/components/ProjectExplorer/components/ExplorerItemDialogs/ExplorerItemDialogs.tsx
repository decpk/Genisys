import { ItemInfoDialog } from '../ItemInfoDialog'
import { DeleteConfirmDialog } from '../DeleteConfirmDialog'
import { RenameDialog } from '../RenameDialog'
import { NewItemDialog } from '../NewItemDialog'
import { MoveCopyDialog } from '../MoveCopyDialog'
import { VSCodeCLIMissingDialog } from '../VSCodeCLIMissingDialog'
import type { ExplorerItemDialogsProps } from './ExplorerItemDialogs.types'

export function ExplorerItemDialogs(props: ExplorerItemDialogsProps): React.JSX.Element {
  const { data } = props

  return (
    <>
      <DeleteConfirmDialog
        open={data.activeDialog?.type === 'delete'}
        onOpenChange={(open) => { if (!open) data.closeDialog() }}
        itemName={data.itemName}
        isFolder={data.item.isFolder}
        onConfirm={data.onDelete}
      />

      <RenameDialog
        open={data.activeDialog?.type === 'rename'}
        onOpenChange={(open) => { if (!open) data.closeDialog() }}
        currentName={data.itemName}
        onConfirm={data.onRename}
      />

      {data.activeDialog?.type === 'newItem' && (
        <NewItemDialog
          open
          onOpenChange={(open) => { if (!open) data.closeDialog() }}
          variant={data.activeDialog.variant}
          onConfirm={data.activeDialog.variant === 'file' ? data.onNewFile : data.onNewFolder}
        />
      )}

      {data.activeDialog?.type === 'moveCopy' && data.rootPath && (
        <MoveCopyDialog
          open
          onOpenChange={(open) => { if (!open) data.closeDialog() }}
          mode={data.activeDialog.mode}
          itemPath={data.item.path}
          isFolder={data.item.isFolder}
          rootPath={data.rootPath}
          onConfirm={data.activeDialog.mode === 'move' ? data.onMoveTo : data.onCopyTo}
        />
      )}

      <VSCodeCLIMissingDialog
        open={data.activeDialog?.type === 'vscodeCli'}
        onOpenChange={(open) => { if (!open) data.closeDialog() }}
        onRetry={data.onRetryVSCode}
      />

      <ItemInfoDialog
        item={data.item}
        rootPath={data.rootPath}
        open={data.activeDialog?.type === 'properties'}
        onOpenChange={(open) => { if (!open) data.closeDialog() }}
      />
    </>
  )
}
