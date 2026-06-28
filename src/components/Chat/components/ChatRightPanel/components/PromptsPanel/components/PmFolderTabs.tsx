import { useCallback } from 'react'
import { Folder, Pencil, Share2, Trash2 } from 'lucide-react'

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import type { PmFolder, PmCategory, PmPrompt } from '@/store/prompt-manager-store'
import { shareFolder } from '@/components/PromptManager/pm-share'

interface PmFolderTabsProps {
  folders: PmFolder[]
  categories: PmCategory[]
  prompts: PmPrompt[]
  activeFolderId: string | null
  onSelectFolder: (id: string) => void
  onEditFolder: (folder: PmFolder) => void
  onDeleteFolder: (id: string) => void
}

export function PmFolderTabs({
  folders,
  categories,
  prompts,
  activeFolderId,
  onSelectFolder,
  onEditFolder,
  onDeleteFolder,
}: PmFolderTabsProps): React.JSX.Element {
  const handleShare = useCallback(
    (folder: PmFolder) => {
      shareFolder(folder, categories, prompts)
    },
    [categories, prompts],
  )

  return (
    <div className="flex gap-1 px-3 pb-2 overflow-x-auto scrollbar-none">
      {folders.map((folder) => {
        const isActive = folder.id === activeFolderId
        return (
          <ContextMenu key={folder.id}>
            <ContextMenuTrigger asChild>
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer border ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'text-muted-foreground/60 hover:text-foreground hover:bg-secondary/40 border-transparent'
                }`}
              >
                {folder.color ? (
                  <span
                    className="shrink-0 size-2.5 rounded-full ring-1 ring-black/5 dark:ring-white/10"
                    style={{ backgroundColor: folder.color }}
                  />
                ) : (
                  <Folder size={11} className="shrink-0 opacity-50" />
                )}
                <span className="truncate max-w-[80px]">{folder.name}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onEditFolder(folder)}>
                <Pencil size={14} /> Rename
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleShare(folder)}>
                <Share2 size={14} /> Share Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                className="text-destructive hover:text-destructive focus:text-destructive data-[highlighted]:text-destructive focus:bg-destructive/8 data-[highlighted]:bg-destructive/8 [&_svg]:text-destructive hover:[&_svg]:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:[&_svg]:text-destructive"
                onClick={() => onDeleteFolder(folder.id)}
              >
                <Trash2 size={14} /> Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })}
    </div>
  )
}
