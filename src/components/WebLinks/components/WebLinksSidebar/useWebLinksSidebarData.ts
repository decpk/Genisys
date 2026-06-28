import { useCallback, useMemo, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { useDeleteAllWebLinks } from '@/components/WebLinks/useDeleteAllWebLinks'

import type { WebLinksSidebarViewModel } from './WebLinksSidebar.types'
import { countPreviews } from './utils/countPreviews'

/**
 * Reads folders + previews from the store and derives the sidebar counts. All
 * counts are computed with `useMemo` (never inside a selector) using the pure
 * `countPreviews` helper, per the project's zustand rules.
 */
export function useWebLinksSidebarData(): WebLinksSidebarViewModel {
  const folders = useWebLinksStore((state) => state.folders)
  const previews = useWebLinksStore((state) => state.previews)
  const selectedFolder = useWebLinksStore((state) => state.selectedFolder)
  const selectFolder = useWebLinksStore((state) => state.selectFolder)
  const { onDeleteAll, canDeleteAll } = useDeleteAllWebLinks()

  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [bookmarkImportOpen, setBookmarkImportOpen] = useState(false)
  const [screenshotImportOpen, setScreenshotImportOpen] = useState(false)

  const allCount = useMemo(() => countPreviews(previews, 'all'), [previews])
  const unfiledCount = useMemo(() => countPreviews(previews, 'unfiled'), [previews])
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const folder of folders) {
      counts[folder.id] = countPreviews(previews, folder.id)
    }
    return counts
  }, [folders, previews])

  const onSelectAll = useCallback(() => selectFolder('all'), [selectFolder])
  const onSelectUnfiled = useCallback(() => selectFolder('unfiled'), [selectFolder])
  const onOpenAddLink = useCallback(() => setAddLinkOpen(true), [])
  const onAddLinkOpenChange = useCallback((open: boolean) => setAddLinkOpen(open), [])
  const onOpenNewFolder = useCallback(() => setNewFolderOpen(true), [])
  const onNewFolderOpenChange = useCallback((open: boolean) => setNewFolderOpen(open), [])
  const onOpenBookmarkImport = useCallback(() => setBookmarkImportOpen(true), [])
  const onBookmarkImportOpenChange = useCallback(
    (open: boolean) => setBookmarkImportOpen(open),
    [],
  )
  const onOpenScreenshotImport = useCallback(() => setScreenshotImportOpen(true), [])
  const onScreenshotImportOpenChange = useCallback(
    (open: boolean) => setScreenshotImportOpen(open),
    [],
  )

  return {
    folders,
    allCount,
    unfiledCount,
    folderCounts,
    selectedFolder,
    addLinkOpen,
    newFolderOpen,
    bookmarkImportOpen,
    screenshotImportOpen,
    onSelectAll,
    onSelectUnfiled,
    onOpenAddLink,
    onAddLinkOpenChange,
    onOpenNewFolder,
    onNewFolderOpenChange,
    onOpenBookmarkImport,
    onBookmarkImportOpenChange,
    onOpenScreenshotImport,
    onScreenshotImportOpenChange,
    onDeleteAll,
    canDeleteAll,
  }
}
