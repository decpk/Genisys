import { Pencil, Trash2 } from 'lucide-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { OpenUrlsInBrowserContextSubmenu } from '@/components/WebLinks/components/OpenUrlsInBrowserContextSubmenu'

import type { FolderRowContextMenuProps } from './FolderRowContextMenu.types'

/**
 * Wraps a folder row so right-clicking it opens the same actions exposed by the
 * hover dropdown: rename, open every saved URL in a chosen browser, and delete.
 * Purely presentational — handlers come from the parent row's `useFolderRowData`.
 */
export function FolderRowContextMenu(props: FolderRowContextMenuProps): React.JSX.Element {
  const { actions, children } = props
  const { onRename, onDelete, onOpenAllUrls, browsers, urlCount } = actions

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={onRename}>
          <Pencil />
          Rename
        </ContextMenuItem>
        <ContextMenuSeparator />
        <OpenUrlsInBrowserContextSubmenu
          browsers={browsers}
          disabled={urlCount === 0}
          onOpen={onOpenAllUrls}
        />
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive" onSelect={onDelete}>
          <Trash2 className="text-destructive" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
