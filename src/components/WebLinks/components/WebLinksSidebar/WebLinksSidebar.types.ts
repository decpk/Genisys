import type {
  PreviewFolder,
  PreviewFolderSelection,
} from '@/components/WebLinks/WebLinks.types'

/** View-model returned by `usePreviewerSidebarData`. */
export interface WebLinksSidebarViewModel {
  /** All folders, ascending by sort order. */
  folders: PreviewFolder[]
  /** Total number of saved previews. */
  allCount: number
  /** Number of previews with no folder. */
  unfiledCount: number
  /** Per-folder preview counts, keyed by folder id. */
  folderCounts: Record<string, number>
  /** The active sidebar selection. */
  selectedFolder: PreviewFolderSelection
  /** Whether the "Add a link" dialog is open. */
  addLinkOpen: boolean
  /** Whether the "New folder" dialog is open. */
  newFolderOpen: boolean
  /** Whether the "Import bookmarks" dialog is open. */
  bookmarkImportOpen: boolean
  /** Whether the "Scan screenshot for URLs" dialog is open. */
  screenshotImportOpen: boolean
  /** Select the "All" view. */
  onSelectAll: () => void
  /** Select the "Unfiled" view. */
  onSelectUnfiled: () => void
  /** Open the "Add a link" dialog. */
  onOpenAddLink: () => void
  /** Controlled open-change handler for the "Add a link" dialog. */
  onAddLinkOpenChange: (open: boolean) => void
  /** Open the "New folder" dialog. */
  onOpenNewFolder: () => void
  /** Controlled open-change handler for the "New folder" dialog. */
  onNewFolderOpenChange: (open: boolean) => void
  /** Open the "Import bookmarks" dialog. */
  onOpenBookmarkImport: () => void
  /** Controlled open-change handler for the "Import bookmarks" dialog. */
  onBookmarkImportOpenChange: (open: boolean) => void
  /** Open the "Scan screenshot for URLs" dialog. */
  onOpenScreenshotImport: () => void
  /** Controlled open-change handler for the "Scan screenshot for URLs" dialog. */
  onScreenshotImportOpenChange: (open: boolean) => void
  /** Delete every saved preview and folder (gated behind a confirm dialog). */
  onDeleteAll: () => void
  /** Whether there is anything to delete (at least one preview or folder). */
  canDeleteAll: boolean
}
