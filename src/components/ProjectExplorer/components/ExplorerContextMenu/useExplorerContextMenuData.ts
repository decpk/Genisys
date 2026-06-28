import { useState, useCallback } from 'react'

import { notify } from "@/frameworks/notification";

import { getBaseName } from '../../utils/getBaseName'
import { getParentPath } from '../../utils/getParentPath'
import type { ActiveDialog, ExplorerContextMenuProps } from './ExplorerContextMenu.types'
import { setClipboard, useClipboardState } from './clipboardState'
import { handleOpenInDefaultApp } from './actions/handleOpenInDefaultApp'
import { handleRevealInFinder } from './actions/handleRevealInFinder'
import { handleOpenInTerminal } from './actions/handleOpenInTerminal'
import { handleOpenInVSCode } from "./actions/handleOpenInVSCode";
import { handleCopyPath } from './actions/handleCopyPath'
import { handleCopyRelativePath } from './actions/handleCopyRelativePath'
import { handleCopyName } from './actions/handleCopyName'
import { handleCopyFileUrl } from './actions/handleCopyFileUrl'
import { handleCopyMarkdownLink } from './actions/handleCopyMarkdownLink'
import { handleNewFromTemplate } from './actions/handleNewFromTemplate'
import { handleDuplicate } from './actions/handleDuplicate'
import { handlePaste } from './actions/handlePaste'
import { handleSoftDelete } from './actions/handleSoftDelete'
import { addFileToLibrary } from './api/addFileToLibrary'
import { isMarkdownFile } from './utils/isMarkdownFile'
import { runWithProgressToast } from './utils/runWithProgressToast'
import { runWithCopyProgressToast } from './utils/runWithCopyProgressToast'
import type { ExplorerTemplate } from './templates'

export function useExplorerContextMenuData(props: ExplorerContextMenuProps) {
  const { item, isLocal, rootPath, onFileHistory, onChanged } = props
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null)
  const clipboardEntry = useClipboardState();

  const isMd = isMarkdownFile(item.path)
  const itemName = getBaseName(item.path)
  const hasClipboard = clipboardEntry !== null

  const closeDialog = useCallback(() => setActiveDialog(null), [])

  const onOpenInDefaultApp = useCallback(() => {
    if (!rootPath) return
    handleOpenInDefaultApp(rootPath, item.path)
  }, [rootPath, item.path])

  const onRevealInFinder = useCallback(() => {
    if (!rootPath) return
    handleRevealInFinder(rootPath, item.path)
  }, [rootPath, item.path])

  const onOpenInTerminal = useCallback(() => {
    if (!rootPath) return
    handleOpenInTerminal(rootPath, item.path)
  }, [rootPath, item.path])

  const onOpenInVSCode = useCallback(async () => {
    if (!rootPath) return
    const result = await handleOpenInVSCode(rootPath, item.path)
    if (result.cliMissing) {
      setActiveDialog({ type: 'vscodeCli' })
    }
  }, [rootPath, item.path])

  const onRetryVSCode = useCallback(async () => {
    if (!rootPath) return
    const result = await handleOpenInVSCode(rootPath, item.path)
    if (result.cliMissing) {
      setActiveDialog({ type: 'vscodeCli' })
    }
  }, [rootPath, item.path])

  const onCut = useCallback(() => {
    if (!rootPath) return
    setClipboard({ mode: 'cut', rootPath, item })
  }, [rootPath, item])

  const onCopy = useCallback(() => {
    if (!rootPath) return
    setClipboard({ mode: 'copy', rootPath, item })
  }, [rootPath, item])

  const onPaste = useCallback(async () => {
    if (!rootPath) return
    const targetFolder = item.isFolder ? item.path : getParentPath(item.path)
    const isCut = clipboardEntry?.mode === 'cut'
    let success: boolean
    if (isCut) {
      success = await runWithProgressToast({
        loadingMessage: 'Moving item…',
        successMessage: 'Paste completed',
        errorMessage: 'Paste failed',
        run: async () => {
          await handlePaste(rootPath, targetFolder)
        }
      })
    } else {
      success = await runWithCopyProgressToast({
        title: 'Pasting…',
        successMessage: 'Paste completed',
        errorMessage: 'Paste failed',
        run: async (operationId) => {
          await handlePaste(rootPath, targetFolder, operationId)
        }
      })
    }
    if (success) {
      onChanged?.()
    }
  }, [rootPath, item, clipboardEntry, onChanged])

  const onDuplicate = useCallback(async () => {
    if (!rootPath) return
    const success = await runWithCopyProgressToast({
      title: 'Duplicating…',
      successMessage: 'Duplicate created',
      errorMessage: 'Duplicate failed',
      run: async (operationId) => {
        await handleDuplicate(rootPath, item.path, item.isFolder, operationId)
      }
    })
    if (success) {
      onChanged?.()
    }
  }, [rootPath, item, onChanged])

  const onDelete = useCallback(async () => {
    if (!rootPath) return
    const success = await runWithProgressToast({
      loadingMessage: 'Deleting item permanently…',
      successMessage: 'Item deleted',
      errorMessage: 'Delete failed',
      run: async () => {
        const result = (await window.api.deleteItem(rootPath, item.path)) as {
          success: boolean
          error?: string
        }
        if (!result.success) {
          throw new Error(result.error ?? 'Failed to delete')
        }
      }
    })
    if (success) {
      onChanged?.()
    }
  }, [rootPath, item.path, onChanged])

  const onSoftDelete = useCallback(async () => {
    if (!rootPath) return
    const success = await runWithProgressToast({
      loadingMessage: 'Moving item to Trash…',
      successMessage: 'Moved to Trash',
      errorMessage: 'Move to Trash failed',
      run: async () => {
        await handleSoftDelete(rootPath, item.path)
      }
    })
    if (success) {
      onChanged?.()
    }
  }, [rootPath, item.path, onChanged])

  const onRename = useCallback(
    async (newName: string) => {
      if (!rootPath) return
      const parent = getParentPath(item.path)
      const newPath = parent === '/' ? newName : `${parent}/${newName}`
      const result = (await window.api.renameItem(rootPath, item.path, newPath)) as {
        success: boolean
        error?: string
      }
      if (!result.success) {
        notify({ type: 'error', source: 'explorer', message: result.error ?? 'Failed to rename' })
        throw new Error(result.error)
      }
      onChanged?.()
    },
    [rootPath, item.path, onChanged]
  )

  const onNewFile = useCallback(
    async (name: string) => {
      if (!rootPath) return
      const folderPath = item.isFolder ? item.path : getParentPath(item.path)
      const filePath = folderPath === '/' ? name : `${folderPath}/${name}`
      const result = (await window.api.createFile(rootPath, filePath, '')) as {
        success: boolean
        error?: string
      }
      if (!result.success) {
        notify({ type: 'error', source: 'explorer', message: result.error ?? 'Failed to create file' })
        throw new Error(result.error)
      }
      onChanged?.()
    },
    [rootPath, item, onChanged]
  )

  const onNewFolder = useCallback(
    async (name: string) => {
      if (!rootPath) return
      const folderPath = item.isFolder ? item.path : getParentPath(item.path)
      const newFolderPath = folderPath === '/' ? name : `${folderPath}/${name}`
      const result = (await window.api.createFolder(rootPath, newFolderPath)) as {
        success: boolean
        error?: string
      }
      if (!result.success) {
        notify({ type: 'error', source: 'explorer', message: result.error ?? 'Failed to create folder' })
        throw new Error(result.error)
      }
      onChanged?.()
    },
    [rootPath, item, onChanged]
  )

  const onMoveTo = useCallback(
    async (destinationFolder: string) => {
      if (!rootPath) return
      const name = getBaseName(item.path)
      const destination = destinationFolder === '/' ? name : `${destinationFolder}/${name}`
      const success = await runWithProgressToast({
        loadingMessage: 'Moving item…',
        successMessage: 'Move completed',
        errorMessage: 'Move failed',
        run: async () => {
          const result = (await window.api.moveItem(rootPath, item.path, destination)) as {
            success: boolean
            error?: string
          }
          if (!result.success) {
            throw new Error(result.error ?? 'Failed to move')
          }
        }
      })
      if (!success) {
        throw new Error('Move failed')
      }
      onChanged?.()
    },
    [rootPath, item, onChanged]
  )

  const onCopyTo = useCallback(
    async (destinationFolder: string) => {
      if (!rootPath) return
      const name = getBaseName(item.path)
      const destination = destinationFolder === '/' ? name : `${destinationFolder}/${name}`
      const success = await runWithCopyProgressToast({
        title: 'Copying…',
        successMessage: 'Copy completed',
        errorMessage: 'Copy failed',
        run: async (operationId) => {
          const result = (await window.api.copyItem(
            rootPath,
            item.path,
            destination,
            undefined,
            operationId
          )) as {
            success: boolean
            error?: string
          }
          if (!result.success) {
            throw new Error(result.error ?? 'Failed to copy')
          }
        }
      })
      if (!success) {
        throw new Error('Copy failed')
      }
      onChanged?.()
    },
    [rootPath, item, onChanged]
  )

  const onCopyFullPath = useCallback(() => {
    if (!rootPath) return
    handleCopyPath(rootPath, item.path)
  }, [rootPath, item.path])

  const onCopyRelPath = useCallback(() => {
    handleCopyRelativePath(item.path)
  }, [item.path])

  const onCopyBaseName = useCallback(() => {
    handleCopyName(item.path)
  }, [item.path])

  const onCopyFileUrl = useCallback(() => {
    if (!rootPath) return
    handleCopyFileUrl(rootPath, item.path)
  }, [rootPath, item.path])

  const onCopyMarkdownLink = useCallback(() => {
    handleCopyMarkdownLink(itemName, item.path)
  }, [itemName, item.path])

  const onNewFromTemplate = useCallback(
    async (template: ExplorerTemplate) => {
      if (!rootPath) return
      const parentPath = item.isFolder ? item.path : getParentPath(item.path)
      const success = await runWithProgressToast({
        loadingMessage: `Creating ${template.filename}…`,
        successMessage: `Created ${template.filename}`,
        errorMessage: `Failed to create ${template.filename}`,
        run: async () => {
          await handleNewFromTemplate({ rootPath, parentPath, template })
        }
      })
      if (success) {
        onChanged?.()
      }
    },
    [rootPath, item, onChanged]
  )

  const onAddToLibrary = useCallback(() => {
    addFileToLibrary(item.path, rootPath)
  }, [item.path, rootPath])

  const onShowFileHistory = useCallback(() => {
    onFileHistory?.(item.path)
  }, [onFileHistory, item.path])

  return {
    activeDialog,
    setActiveDialog,
    closeDialog,
    itemName,
    isMd,
    isLocal,
    hasClipboard,
    onOpenInDefaultApp,
    onRevealInFinder,
    onOpenInTerminal,
    onOpenInVSCode,
    onRetryVSCode,
    onCut,
    onCopy,
    onPaste,
    onDuplicate,
    onSoftDelete,
    onDelete,
    onRename,
    onNewFile,
    onNewFolder,
    onMoveTo,
    onCopyTo,
    onCopyFullPath,
    onCopyRelPath,
    onCopyBaseName,
    onCopyFileUrl,
    onCopyMarkdownLink,
    onNewFromTemplate,
    onAddToLibrary,
    onShowFileHistory,
    onFileHistory,
    item,
    rootPath,
  };
}

export type ExplorerContextMenuData = ReturnType<typeof useExplorerContextMenuData>
