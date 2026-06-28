import { useCallback, useMemo, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useInstalledBrowsers } from '@/hooks/useInstalledBrowsers'
import { scopedToast } from '@/frameworks/notification'
import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'
import type { BrowserApp } from '@/tauri-api-bridge'

import { selectFolderPreviewUrls } from '@/components/WebLinks/utils/selectFolderPreviewUrls'
import { openUrlsInBrowser } from '@/components/WebLinks/api/openUrlsInBrowser'
import type { FolderRowViewModel } from './FolderRow.types'

const toast = scopedToast('weblinks')

/**
 * Local state + handlers for a folder row: select, rename (dialog), delete
 * (routed through the app-wide confirm dialog), and opening every saved-preview
 * URL in the folder in a chosen browser. Deleting a folder unfiles its
 * previews — surfaced in the confirmation copy.
 */
export function useFolderRowData(folder: PreviewFolder): FolderRowViewModel {
  const selectFolder = useWebLinksStore((state) => state.selectFolder)
  const deleteFolder = useWebLinksStore((state) => state.deleteFolder)
  const previews = useWebLinksStore((state) => state.previews)
  const openConfirmDialog = useConfirmDialogStore((state) => state.openConfirmDialog)
  const browsers = useInstalledBrowsers()

  const [menuOpen, setMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)

  const folderUrls = useMemo(
    () => selectFolderPreviewUrls(previews, folder.id),
    [previews, folder.id]
  )

  const onSelect = useCallback(() => selectFolder(folder.id), [selectFolder, folder.id])
  const onRename = useCallback(() => setRenameOpen(true), [])
  const onRenameOpenChange = useCallback((open: boolean) => setRenameOpen(open), [])

  const onMenuTriggerClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  const onDelete = useCallback(() => {
    openConfirmDialog({
      title: 'Delete folder',
      description: `Delete "${folder.name}"? Saved previews inside it will become unfiled.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: () => deleteFolder(folder.id),
    })
  }, [openConfirmDialog, deleteFolder, folder.id, folder.name])

  const onOpenAllUrls = useCallback(
    (browser?: BrowserApp): void => {
      if (folderUrls.length === 0) {
        toast.info('No URLs in this folder.')
        return
      }
      const target = browser?.name ?? 'default browser'
      void openUrlsInBrowser(folderUrls, browser?.appName)
        .then((opened) => {
          const noun = opened === 1 ? 'URL' : 'URLs'
          toast.success(`Opened ${opened} ${noun} in ${target}`)
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          toast.error(`Failed to open URLs: ${message}`)
        })
    },
    [folderUrls]
  )

  return {
    menuOpen,
    setMenuOpen,
    renameOpen,
    onRenameOpenChange,
    onSelect,
    onRename,
    onDelete,
    onMenuTriggerClick,
    browsers,
    urlCount: folderUrls.length,
    onOpenAllUrls,
  }
}
