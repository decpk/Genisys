import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'

/** Props for the confirm-view footer (target-folder picker + import action). */
export interface BookmarkImportFooterProps {
  /** All collection folders to offer in the picker. */
  folders: PreviewFolder[]
  /** Currently selected target folder id, or null for "Unfiled". */
  targetFolderId: string | null
  /** Display name of the current target folder. */
  targetFolderName: string
  /** Number of bookmarks that will be imported. */
  bookmarkCount: number
  /** Whether an import is currently in flight. */
  importing: boolean
  /** Whether the nested "New folder" dialog is open. */
  newFolderOpen: boolean
  /** Whether to recreate the browser's folder structure on import. */
  preserveFolders: boolean
  /** Whether any parsed bookmark carries a browser folder (gates the toggle). */
  hasBrowserFolders: boolean
  /** Choose the target folder (null = Unfiled). */
  onSelectFolder: (folderId: string | null) => void
  /** Trigger the import. */
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
