import { ChevronDown, Folder, FolderPlus, Inbox } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { AppInlineLoader } from '@/components/AppLoader'

import { NewFolderDialog } from '../../../NewFolderDialog'
import type { BookmarkImportFooterProps } from './BookmarkImportFooter.types'
import { STYLES } from './BookmarkImportFooter.styles'

/** Target-folder picker + import action shown in the dialog's confirm view. */
export function BookmarkImportFooter(props: BookmarkImportFooterProps): React.JSX.Element {
  const {
    folders,
    targetFolderName,
    bookmarkCount,
    importing,
    newFolderOpen,
    preserveFolders,
    hasBrowserFolders,
    onSelectFolder,
    onImport,
    onOpenNewFolder,
    onNewFolderOpenChange,
    onFolderCreated,
    onTogglePreserveFolders,
  } = props

  const folderItems = folders.map((folder) => (
    <DropdownMenuItem key={folder.id} onSelect={() => onSelectFolder(folder.id)}>
      <Folder />
      {folder.name}
    </DropdownMenuItem>
  ))

  const importLabel = `Import ${bookmarkCount} ${bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}`
  let importContent: React.ReactNode = importLabel
  if (importing) importContent = <AppInlineLoader size={14} />

  let folderToggle: React.ReactNode = null
  if (hasBrowserFolders) {
    folderToggle = (
      <label className={STYLES.toggle}>
        <Checkbox
          checked={preserveFolders}
          onCheckedChange={(checked) => onTogglePreserveFolders(checked === true)}
        />
        <span className={STYLES.toggleText}>Keep browser folder names</span>
      </label>
    )
  }

  return (
    <div className={STYLES.root}>
      {folderToggle}
      <div className={STYLES.field}>
        <span className={STYLES.label}>Add to folder</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className={STYLES.pickerTrigger}>
              <span className={STYLES.pickerName}>{targetFolderName}</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Add to folder</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => onSelectFolder(null)}>
              <Inbox />
              Unfiled
            </DropdownMenuItem>
            {folderItems}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onOpenNewFolder}>
              <FolderPlus />
              New folder…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Button type="button" onClick={onImport} disabled={importing || bookmarkCount === 0}>
        {importContent}
      </Button>

      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={onNewFolderOpenChange}
        onCreated={onFolderCreated}
      />
    </div>
  )
}
