import { Layers, Inbox, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { NavRow } from './components/NavRow'
import { FolderRow } from './components/FolderRow'
import { WebLinksSidebarHeader } from './components/WebLinksSidebarHeader'
import { AddLinkDialog } from '../AddLinkDialog'
import { NewFolderDialog } from '../NewFolderDialog'
import { BookmarkImportDialog } from '../BookmarkImportDialog'
import { ScreenshotImportDialog } from '../ScreenshotImportDialog'

import { STYLES } from './WebLinksSidebar.styles'
import { useWebLinksSidebarData } from './useWebLinksSidebarData'

/** Collections sidebar: "All" / "Unfiled" nav rows plus the folder tree. */
export function WebLinksSidebar(): React.JSX.Element {
  const {
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
  } = useWebLinksSidebarData()

  const folderRows = folders.map((folder) => (
    <FolderRow
      key={folder.id}
      folder={folder}
      count={folderCounts[folder.id] ?? 0}
      isActive={selectedFolder === folder.id}
    />
  ))

  return (
    <div className={STYLES.root}>
      <WebLinksSidebarHeader
        onOpenScreenshotImport={onOpenScreenshotImport}
        onOpenBookmarkImport={onOpenBookmarkImport}
        onOpenAddLink={onOpenAddLink}
        onOpenNewFolder={onOpenNewFolder}
      />

      <nav className={STYLES.nav}>
        <NavRow
          icon={Layers}
          label="All"
          count={allCount}
          isActive={selectedFolder === 'all'}
          onClick={onSelectAll}
        />
        <NavRow
          icon={Inbox}
          label="Unfiled"
          count={unfiledCount}
          isActive={selectedFolder === 'unfiled'}
          onClick={onSelectUnfiled}
        />
        <div className={STYLES.divider} />
        {folderRows}
      </nav>

      {canDeleteAll && (
        <div className={STYLES.footer}>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={STYLES.deleteAllButton}
            onClick={onDeleteAll}
          >
            <Trash2 size={14} />
            Delete all
          </Button>
        </div>
      )}

      <AddLinkDialog open={addLinkOpen} onOpenChange={onAddLinkOpenChange} />
      <NewFolderDialog open={newFolderOpen} onOpenChange={onNewFolderOpenChange} />
      <BookmarkImportDialog open={bookmarkImportOpen} onOpenChange={onBookmarkImportOpenChange} />
      <ScreenshotImportDialog
        open={screenshotImportOpen}
        onOpenChange={onScreenshotImportOpenChange}
      />
    </div>
  )
}
