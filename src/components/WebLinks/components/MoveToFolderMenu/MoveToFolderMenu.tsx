import { Inbox, Folder } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import type { MoveToFolderMenuProps } from './MoveToFolderMenu.types'
import { useMoveToFolderMenuData } from './useMoveToFolderMenuData'

/** Dropdown that moves a saved preview into "Unfiled" or any folder. */
export function MoveToFolderMenu(props: MoveToFolderMenuProps): React.JSX.Element {
  const { previewId, children } = props
  const { folders, onMoveToUnfiled, onMoveToFolder } = useMoveToFolderMenuData(previewId)

  const folderItems = folders.map((folder) => (
    <DropdownMenuItem key={folder.id} onSelect={() => onMoveToFolder(folder.id)}>
      <Folder />
      {folder.name}
    </DropdownMenuItem>
  ))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Move to</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onMoveToUnfiled}>
          <Inbox />
          Unfiled
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {folderItems}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
