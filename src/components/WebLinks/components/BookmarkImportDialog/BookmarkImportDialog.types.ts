import type {
  BrowserBookmark,
  BrowserBookmarkSource,
  PreviewFolder,
} from '@/components/WebLinks/WebLinks.types'

/**
 * The single active view of the import dialog's small state machine. Exactly
 * one of these is rendered at a time, derived from the dialog's loading/error
 * flags via `computeBookmarkImportView` (no chained ternaries).
 */
export type BookmarkImportView =
  | 'loading-sources'
  | 'sources-error'
  | 'no-sources'
  | 'pick-source'
  | 'loading-bookmarks'
  | 'bookmarks-error'
  | 'confirm'
  | 'done'

/** Descriptor for the toast shown after a bookmark import completes. */
export interface ImportToastDescriptor {
  /** Toast severity: `warning` when duplicates were skipped, else `success`. */
  type: 'success' | 'warning'
  /** Primary toast line (e.g. "Imported 12 bookmarks"). */
  message: string
  /** Secondary line shown only for warnings (e.g. "3 duplicates skipped"). */
  description?: string
  /** Auto-dismiss duration in ms. */
  duration: number
}

/** Props for the controlled bookmark-import dialog. */
export interface BookmarkImportDialogProps {
  /** Whether the dialog is open. */
  open: boolean
  /** Controlled open-change handler. */
  onOpenChange: (open: boolean) => void
}

/** View-model returned by `useBookmarkImportDialogData`. */
export interface BookmarkImportDialogViewModel {
  /** The active view to render. */
  view: BookmarkImportView
  /** Detected browser bookmark sources on this machine. */
  sources: BrowserBookmarkSource[]
  /** The source the user picked, or null before a pick. */
  selectedSource: BrowserBookmarkSource | null
  /** Bookmarks parsed from the selected source. */
  bookmarks: BrowserBookmark[]
  /** All collection folders (for the target-folder picker). */
  folders: PreviewFolder[]
  /** Target folder id, or null for "Unfiled". */
  targetFolderId: string | null
  /** Display name of the current target folder ("Unfiled" when null). */
  targetFolderName: string
  /** Error from reading the selected source's bookmarks, or null. */
  error: string | null
  /** Error from detecting sources, or null. */
  sourcesError: string | null
  /** Number of bookmarks imported after a successful import, or null. */
  importedCount: number | null
  /** Whether an import is currently in flight. */
  importing: boolean
  /** Whether the nested "New folder" dialog is open. */
  newFolderOpen: boolean
  /** Whether to recreate the browser's folder structure on import. */
  preserveFolders: boolean
  /** Whether any parsed bookmark carries a browser folder (gates the toggle). */
  hasBrowserFolders: boolean
  /** Pick a source and read its bookmarks. */
  onPickSource: (source: BrowserBookmarkSource) => void
  /** Choose the target folder (null = Unfiled). */
  onSelectFolder: (folderId: string | null) => void
  /** Return from a bookmarks error back to the source picker. */
  onBack: () => void
  /** Import the parsed bookmarks into the target folder. */
  onImport: () => void
  /** Open the nested "New folder" dialog. */
  onOpenNewFolder: () => void
  /** Controlled open-change handler for the nested "New folder" dialog. */
  onNewFolderOpenChange: (open: boolean) => void
  /** Called with the newly created folder; selects it as the target. */
  onFolderCreated: (folder: PreviewFolder) => void
  /** Toggle whether browser folder names are recreated on import. */
  onTogglePreserveFolders: (value: boolean) => void
}
