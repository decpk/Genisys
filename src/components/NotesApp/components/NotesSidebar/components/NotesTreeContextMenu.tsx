import {
  ArrowUpDown, Check, Copy, FileText, FolderInput, Folders, Pencil, Pin, PinOff, Plus, Share2, Star, StarOff, Trash2,
} from 'lucide-react'

import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent,
} from '@/components/ui/context-menu'

import { NotesExportSubmenu } from '../../../notes-export'

import type { NotesSidebarSort } from '@/store/notes-app-store'
import type { TreeNode } from '../useNotesSidebarData'

interface NotesTreeContextMenuProps {
  node: TreeNode
  children: React.ReactNode
  isTrashed?: boolean
  onRename: (node: TreeNode) => void
  onDuplicate: (node: TreeNode) => void
  onMove: (node: TreeNode) => void
  onMoveToProject?: (node: TreeNode) => void
  onTogglePin: (node: TreeNode) => void
  onToggleFavorite: (node: TreeNode) => void
  onTrash: (node: TreeNode) => void
  onDelete: (node: TreeNode) => void
  onAddNote: (node: TreeNode) => void
  onAddSubgroup: (node: TreeNode) => void
  onShare: (node: TreeNode) => void
  onRestore?: (node: TreeNode) => void
  onDeletePermanently?: (node: TreeNode) => void
  onSetSortPreference?: (node: TreeNode, sortPreference: NotesSidebarSort | null) => void
}

interface SortOption {
  key: NotesSidebarSort | null
  label: string
}

const SORT_PREFERENCE_OPTIONS: SortOption[] = [
  { key: null, label: 'Default (inherit)' },
  { key: 'title-asc', label: 'Name (A–Z)' },
  { key: 'title-desc', label: 'Name (Z–A)' },
  { key: 'created-desc', label: 'Date created (newest first)' },
  { key: 'created-asc', label: 'Date created (oldest first)' },
  { key: 'updated-desc', label: 'Date modified (newest first)' },
  { key: 'updated-asc', label: 'Date modified (oldest first)' },
]

function SortBySubmenu({
  node,
  onSetSortPreference,
}: {
  node: TreeNode
  onSetSortPreference: (node: TreeNode, sortPreference: NotesSidebarSort | null) => void
}): React.JSX.Element {
  const current = node.sortPreference ?? null
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <ArrowUpDown size={15} /> Sort by
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {SORT_PREFERENCE_OPTIONS.map((option) => {
          const isActive = option.key === current
          return (
            <ContextMenuItem
              key={option.key ?? 'inherit'}
              onClick={() => onSetSortPreference(node, option.key)}
            >
              {isActive ? <Check size={15} /> : <span className="size-[15px] shrink-0" />}
              {option.label}
            </ContextMenuItem>
          )
        })}
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

export function NotesTreeContextMenu({
  node,
  children,
  isTrashed = false,
  onRename,
  onDuplicate,
  onMove,
  onMoveToProject,
  onTogglePin,
  onToggleFavorite,
  onTrash,
  onDelete,
  onAddNote,
  onAddSubgroup,
  onShare,
  onRestore,
  onDeletePermanently,
  onSetSortPreference,
}: NotesTreeContextMenuProps): React.JSX.Element {
  const isNote = node.type === 'note'
  const isProject = node.type === 'project'
  const isSystem = node.isSystem === true
  const canAddSubgroup = node.type === 'notebook' || node.type === 'section'
  const canMove = node.type === 'note' || node.type === 'section' || node.type === 'topic'

  // Trash view: show restore/delete permanently
  if (isTrashed && isNote) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRestore?.(node)}>
            <Pin size={15} className="rotate-45" /> Restore
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onDeletePermanently?.(node)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={15} className="text-destructive" /> Delete Permanently
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  // Note context menu
  if (isNote) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRename(node)}>
            <Pencil size={15} /> Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDuplicate(node)}>
            <Copy size={15} /> Duplicate
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onMove(node)}>
            <FolderInput size={15} /> Move to...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onTogglePin(node)}>
            {node.isPinned ? <PinOff size={15} /> : <Pin size={15} />}
            {node.isPinned ? 'Unpin' : 'Pin to top'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onToggleFavorite(node)}>
            {node.isFavorite ? <StarOff size={15} /> : <Star size={15} />}
            {node.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <NotesExportSubmenu subject={{ kind: 'container', node }} />
          <ContextMenuItem onClick={() => onShare(node)}>
            <Share2 size={15} /> Share to device
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => onTrash(node)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={15} className="text-destructive" /> Move to Trash
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  // Project context menu
  if (isProject) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onAddSubgroup(node)}>
            <Plus size={15} /> Add Notebook
          </ContextMenuItem>
          <ContextMenuSeparator />
          {!isSystem && (
            <ContextMenuItem onClick={() => onRename(node)}>
              <Pencil size={15} /> Rename
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => onToggleFavorite(node)}>
            {node.isFavorite ? <StarOff size={15} /> : <Star size={15} />}
            {node.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          </ContextMenuItem>
          {onSetSortPreference && (
            <SortBySubmenu node={node} onSetSortPreference={onSetSortPreference} />
          )}
          <ContextMenuSeparator />
          <NotesExportSubmenu subject={{ kind: 'container', node }} />
          <ContextMenuItem onClick={() => onShare(node)}>
            <Share2 size={15} /> Share to device
          </ContextMenuItem>
          {!isSystem && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => onDelete(node)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 size={15} className="text-destructive" /> Delete Project
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  // Container context menu (notebook / section / topic)
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onAddNote(node)}>
          <FileText size={15} /> Add Note
        </ContextMenuItem>
        {canAddSubgroup && (
          <ContextMenuItem onClick={() => onAddSubgroup(node)}>
            <Plus size={15} /> {node.type === 'notebook' ? 'Add Section' : 'Add Topic'}
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {!isSystem && (
          <ContextMenuItem onClick={() => onRename(node)}>
            <Pencil size={15} /> Rename
          </ContextMenuItem>
        )}
        {canMove && !isSystem && (
          <ContextMenuItem onClick={() => onMove(node)}>
            <FolderInput size={15} /> Move to...
          </ContextMenuItem>
        )}
        {node.type === 'notebook' && !isSystem && onMoveToProject && (
          <ContextMenuItem onClick={() => onMoveToProject(node)}>
            <Folders size={15} /> Move to project...
          </ContextMenuItem>
        )}
        {node.type === 'notebook' && onSetSortPreference && (
          <SortBySubmenu node={node} onSetSortPreference={onSetSortPreference} />
        )}
        <ContextMenuSeparator />
        <NotesExportSubmenu subject={{ kind: 'container', node }} />
        <ContextMenuItem onClick={() => onShare(node)}>
          <Share2 size={15} /> Share to device
        </ContextMenuItem>
        {!isSystem && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onDelete(node)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={15} className="text-destructive" /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
