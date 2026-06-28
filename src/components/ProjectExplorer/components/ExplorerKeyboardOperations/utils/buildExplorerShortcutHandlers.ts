import type { ExplorerContextMenuData } from '../../ExplorerContextMenu/useExplorerContextMenuData'
import type { ExplorerShortcutAction } from '../ExplorerKeyboardOperations.types'

export function buildExplorerShortcutHandlers(
  data: ExplorerContextMenuData
): Record<ExplorerShortcutAction, () => void> {
  return {
    rename: () => data.setActiveDialog({ type: 'rename' }),
    deletePermanent: () => data.setActiveDialog({ type: 'delete' }),
    softDelete: () => data.onSoftDelete(),
    copy: () => data.onCopy(),
    cut: () => data.onCut(),
    paste: () => {
      if (data.hasClipboard) data.onPaste()
    },
    duplicate: () => data.onDuplicate(),
    newFile: () => data.setActiveDialog({ type: 'newItem', variant: 'file' }),
    newFolder: () => data.setActiveDialog({ type: 'newItem', variant: 'folder' }),
    properties: () => data.setActiveDialog({ type: 'properties' }),
    copyPath: () => data.onCopyFullPath()
  }
}
