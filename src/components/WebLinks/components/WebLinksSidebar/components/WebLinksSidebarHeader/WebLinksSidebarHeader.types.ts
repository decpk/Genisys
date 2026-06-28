/** Props for the `WebLinksSidebarHeader` (all callbacks from the sidebar hook). */
export interface WebLinksSidebarHeaderProps {
  /** Open the "Scan screenshot for URLs" dialog. */
  onOpenScreenshotImport: () => void
  /** Open the "Import bookmarks" dialog. */
  onOpenBookmarkImport: () => void
  /** Open the "Add a link" dialog. */
  onOpenAddLink: () => void
  /** Open the "New folder" dialog. */
  onOpenNewFolder: () => void
}
