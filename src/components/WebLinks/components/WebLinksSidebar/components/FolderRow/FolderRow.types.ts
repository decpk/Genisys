import type { PreviewFolder } from '@/components/WebLinks/WebLinks.types'
import type { BrowserApp } from '@/tauri-api-bridge'

/** Props for a folder row in the collections sidebar. */
export interface FolderRowProps {
  /** The folder this row represents. */
  folder: PreviewFolder
  /** Number of previews filed under this folder. */
  count: number
  /** Whether this folder is the active selection. */
  isActive: boolean
}

/**
 * Folder-level actions shared by every surface that exposes them (the hover
 * actions dropdown and the right-click context menu). Sourced from
 * `useFolderRowData` so the two menus stay in sync.
 */
export interface FolderRowActions {
  /** Open the rename dialog. */
  onRename: () => void
  /** Confirm + delete this folder. */
  onDelete: () => void
  /** Open all of this folder's preview URLs in the given browser (or default). */
  onOpenAllUrls: (browser?: BrowserApp) => void
  /** Installed browsers available to open this folder's URLs in. */
  browsers: BrowserApp[]
  /** Number of openable URLs across this folder's saved previews. */
  urlCount: number
}

/** View-model returned by `useFolderRowData`. */
export interface FolderRowViewModel {
  /** Whether the row's actions menu is open. */
  menuOpen: boolean
  /** Controlled open-change handler for the actions menu. */
  setMenuOpen: (open: boolean) => void
  /** Whether the rename dialog is open. */
  renameOpen: boolean
  /** Controlled open-change handler for the rename dialog. */
  onRenameOpenChange: (open: boolean) => void
  /** Select this folder. */
  onSelect: () => void
  /** Open the rename dialog. */
  onRename: () => void
  /** Confirm + delete this folder. */
  onDelete: () => void
  /** Stop a menu-trigger click from bubbling to the row select handler. */
  onMenuTriggerClick: (event: React.MouseEvent) => void
  /** Installed browsers available to open this folder's URLs in. */
  browsers: BrowserApp[]
  /** Number of openable URLs across this folder's saved previews. */
  urlCount: number
  /** Open all of this folder's preview URLs in the given browser (or default). */
  onOpenAllUrls: (browser?: BrowserApp) => void
}
