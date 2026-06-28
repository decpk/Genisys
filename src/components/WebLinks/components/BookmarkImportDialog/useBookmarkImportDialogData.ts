import { useCallback, useMemo, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { scopedToast } from '@/frameworks/notification'
import type {
  BrowserBookmark,
  BrowserBookmarkSource,
  PreviewFolder,
} from '@/components/WebLinks/WebLinks.types'

import type { BookmarkImportDialogViewModel } from './BookmarkImportDialog.types'
import { buildImportToast } from './utils/buildImportToast'
import { computeBookmarkImportView } from './utils/computeBookmarkImportView'
import { errorMessage } from './utils/errorMessage'

const toast = scopedToast('weblinks')

/** Delay (ms) the success state is shown before the dialog auto-closes. */
const DONE_CLOSE_DELAY = 1000

/**
 * Drives the bookmark-import dialog: detects browser sources on open, reads a
 * chosen source's bookmarks, picks a target folder, then imports. State reset +
 * the source load are triggered with the render-phase previous-value pattern so
 * no setState-in-effect is needed (the repo lints that as an error).
 */
export function useBookmarkImportDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): BookmarkImportDialogViewModel {
  const loadBookmarkSources = useWebLinksStore((state) => state.loadBookmarkSources)
  const fetchBrowserBookmarks = useWebLinksStore((state) => state.fetchBrowserBookmarks)
  const importBookmarks = useWebLinksStore((state) => state.importBookmarks)
  const folders = useWebLinksStore((state) => state.folders)

  const [sources, setSources] = useState<BrowserBookmarkSource[]>([])
  const [selectedSource, setSelectedSource] = useState<BrowserBookmarkSource | null>(null)
  const [bookmarks, setBookmarks] = useState<BrowserBookmark[]>([])
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null)
  const [loadingSources, setLoadingSources] = useState(false)
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sourcesError, setSourcesError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState<number | null>(null)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [preserveFolders, setPreserveFolders] = useState(false)
  const [prevOpen, setPrevOpen] = useState(open)

  const loadSources = useCallback(async () => {
    setLoadingSources(true)
    setSourcesError(null)
    try {
      const found = await loadBookmarkSources()
      setSources(found)
    } catch (caught) {
      setSourcesError(errorMessage(caught))
    } finally {
      setLoadingSources(false)
    }
  }, [loadBookmarkSources])

  // Reset state + (re)detect sources each time the dialog opens (render-phase pattern).
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSources([])
      setSelectedSource(null)
      setBookmarks([])
      setTargetFolderId(null)
      setError(null)
      setSourcesError(null)
      setImportedCount(null)
      setImporting(false)
      setLoadingBookmarks(false)
      setNewFolderOpen(false)
      setPreserveFolders(false)
      void loadSources()
    }
  }

  const onPickSource = useCallback(
    (source: BrowserBookmarkSource) => {
      setSelectedSource(source)
      setError(null)
      setLoadingBookmarks(true)
      void (async () => {
        try {
          const found = await fetchBrowserBookmarks(source.browser, source.path)
          setBookmarks(found)
        } catch (caught) {
          setError(errorMessage(caught))
        } finally {
          setLoadingBookmarks(false)
        }
      })()
    },
    [fetchBrowserBookmarks],
  )

  const onBack = useCallback(() => {
    setSelectedSource(null)
    setBookmarks([])
    setError(null)
  }, [])

  const onSelectFolder = useCallback((folderId: string | null) => {
    setTargetFolderId(folderId)
  }, [])

  const onImport = useCallback(() => {
    if (bookmarks.length === 0) return
    setImporting(true)
    setError(null)
    void (async () => {
      try {
        const result = await importBookmarks(bookmarks, targetFolderId, preserveFolders)
        const descriptor = buildImportToast(result)
        if (descriptor.type === 'warning') {
          toast.warning(descriptor.message, {
            description: descriptor.description,
            duration: descriptor.duration,
          })
        } else {
          toast.success(descriptor.message, { duration: descriptor.duration })
        }
        setImportedCount(result.imported)
        window.setTimeout(() => onOpenChange(false), DONE_CLOSE_DELAY)
      } catch (caught) {
        setError(errorMessage(caught))
      } finally {
        setImporting(false)
      }
    })()
  }, [bookmarks, targetFolderId, preserveFolders, importBookmarks, onOpenChange])

  const onOpenNewFolder = useCallback(() => setNewFolderOpen(true), [])
  const onNewFolderOpenChange = useCallback((next: boolean) => setNewFolderOpen(next), [])
  const onFolderCreated = useCallback((folder: PreviewFolder) => {
    setTargetFolderId(folder.id)
  }, [])

  const onTogglePreserveFolders = useCallback((value: boolean) => {
    setPreserveFolders(value)
  }, [])

  const hasBrowserFolders = useMemo(
    () => bookmarks.some((bookmark) => bookmark.folderPath.trim().length > 0),
    [bookmarks],
  )

  const targetFolderName = useMemo(() => {
    if (targetFolderId === null) return 'Unfiled'
    return folders.find((folder) => folder.id === targetFolderId)?.name ?? 'Unfiled'
  }, [targetFolderId, folders])

  const view = computeBookmarkImportView({
    loadingSources,
    sourcesError,
    selectedSource,
    loadingBookmarks,
    error,
    sourceCount: sources.length,
    importedCount,
  })

  return {
    view,
    sources,
    selectedSource,
    bookmarks,
    folders,
    targetFolderId,
    targetFolderName,
    error,
    sourcesError,
    importedCount,
    importing,
    newFolderOpen,
    preserveFolders,
    hasBrowserFolders,
    onPickSource,
    onSelectFolder,
    onBack,
    onImport,
    onOpenNewFolder,
    onNewFolderOpenChange,
    onFolderCreated,
    onTogglePreserveFolders,
  }
}
