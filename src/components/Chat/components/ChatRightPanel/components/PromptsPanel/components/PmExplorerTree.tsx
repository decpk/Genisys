import { useState, useCallback, useMemo } from 'react'
import {
  ChevronRight,
  Copy,
  Eye,
  Folder,
  FolderOpen,
  Layers,
  FileText,
  MessageSquarePlus,
  MoveRight,
  Plus,
  Pencil,
  Target,
  Trash2,
  Share2,
  Lock,
} from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import type { PmFolder, PmCategory, PmPrompt } from '@/store/prompt-manager-store'
import { shareFolder, sharePrompt } from '@/components/PromptManager/pm-share'

// ─── Types ──────────────────────────────────────────────────────

interface PmExplorerTreeProps {
  folders: PmFolder[]
  categories: PmCategory[]
  prompts: PmPrompt[]
  onSelectPrompt: (prompt: PmPrompt) => void
  onEditFolder: (folder: PmFolder) => void
  onDeleteFolder: (id: string) => void
  onEditCategory: (category: PmCategory) => void
  onDeleteCategory: (id: string) => void
  onAddCategory: (folderId: string) => void
  onAddPrompt: (opts: { folderId: string; categoryId: string }) => void
  onUsePrompt: (prompt: PmPrompt) => void
  onEditPrompt: (prompt: PmPrompt) => void
  onMovePrompt: (prompt: PmPrompt) => void
  onDeletePrompt: (id: string) => void
}

// ─── Folder Node ────────────────────────────────────────────────

function FolderNode({
  folder,
  categories,
  prompts,
  onSelectPrompt,
  onEditFolder,
  onDeleteFolder,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onAddPrompt,
  onUsePrompt,
  onEditPrompt,
  onMovePrompt,
  onDeletePrompt,
}: {
  folder: PmFolder
  categories: PmCategory[]
  prompts: PmPrompt[]
} & Omit<PmExplorerTreeProps, 'folders'>) {
  const [expanded, setExpanded] = useState(Boolean(folder.isBuiltIn))
  const [loading, setLoading] = useState(false)

  const folderCategories = useMemo(
    () => categories.filter((c) => c.folderId === folder.id).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, folder.id],
  )

  const toggle = useCallback(() => {
    if (!expanded) {
      setLoading(true)
      // Simulate async load delay for smooth UX
      requestAnimationFrame(() => {
        setExpanded(true)
        setLoading(false)
      })
    } else {
      setExpanded(false)
    }
  }, [expanded])

  const handleShare = useCallback(() => {
    shareFolder(folder, categories, prompts)
  }, [folder, categories, prompts])

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[12px] hover:bg-secondary/60 transition-colors cursor-pointer group/folder select-none"
          >
            <ChevronRight
              size={12}
              className={`shrink-0 text-muted-foreground/40 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
            />
            {folder.color ? (
              <span className="shrink-0 flex items-center justify-center">
                {expanded ? (
                  <FolderOpen size={15} style={{ color: folder.color }} />
                ) : (
                  <Folder size={15} style={{ color: folder.color }} />
                )}
              </span>
            ) : (
              <span className="shrink-0 text-amber-500/70 dark:text-amber-400/70">
                {expanded ? <FolderOpen size={15} /> : <Folder size={15} />}
              </span>
            )}
            <span className="flex-1 text-left truncate text-foreground/90 font-semibold text-[12px]">
              {folder.name}
            </span>
            {folder.isBuiltIn && <Lock size={10} className="shrink-0 text-muted-foreground/45" />}
            {loading && <AppLoaderGlyph size={10} className="shrink-0 text-muted-foreground/40" />}
            <span className="text-[10px] text-muted-foreground/30 tabular-nums opacity-0 group-hover/folder:opacity-100 transition-opacity">
              {folderCategories.length}
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {!folder.isBuiltIn && (
            <ContextMenuItem onClick={() => onAddCategory(folder.id)}>
              <Plus size={14} /> New Category
            </ContextMenuItem>
          )}
          {!folder.isBuiltIn && (
            <ContextMenuItem onClick={() => onEditFolder(folder)}>
              <Pencil size={14} /> Rename
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => onEditFolder(folder)}>
            <Target size={14} /> Scope to apps…
          </ContextMenuItem>
          <ContextMenuItem onClick={handleShare}>
            <Share2 size={14} /> Share Folder
          </ContextMenuItem>
          {!folder.isBuiltIn && <ContextMenuSeparator />}
          {!folder.isBuiltIn && (
            <ContextMenuItem
              className="text-destructive hover:text-destructive focus:text-destructive data-[highlighted]:text-destructive focus:bg-destructive/8 data-[highlighted]:bg-destructive/8 [&_svg]:text-destructive hover:[&_svg]:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:[&_svg]:text-destructive"
              onClick={() => onDeleteFolder(folder.id)}
            >
              <Trash2 size={14} /> Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {expanded && (
        <div className="ml-3 pl-2 border-l border-border/20">
          {folderCategories.length === 0 ? (
            !folder.isBuiltIn && (
              <button
                onClick={() => onAddCategory(folder.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] text-muted-foreground/30 hover:text-muted-foreground/50 hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <Plus size={10} /> Add category
              </button>
            )
          ) : (
            folderCategories.map((cat) => (
              <CategoryNode
                key={cat.id}
                category={cat}
                folder={folder}
                prompts={prompts}
                onSelectPrompt={onSelectPrompt}
                onEditCategory={onEditCategory}
                onDeleteCategory={onDeleteCategory}
                onAddPrompt={onAddPrompt}
                onUsePrompt={onUsePrompt}
                onEditPrompt={onEditPrompt}
                onMovePrompt={onMovePrompt}
                onDeletePrompt={onDeletePrompt}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Category Node ──────────────────────────────────────────────

function CategoryNode({
  category,
  folder,
  prompts,
  onSelectPrompt,
  onEditCategory,
  onDeleteCategory,
  onAddPrompt,
  onUsePrompt,
  onEditPrompt,
  onMovePrompt,
  onDeletePrompt,
}: {
  category: PmCategory
  folder: PmFolder
  prompts: PmPrompt[]
  onSelectPrompt: (prompt: PmPrompt) => void
  onEditCategory: (category: PmCategory) => void
  onDeleteCategory: (id: string) => void
  onAddPrompt: (opts: { folderId: string; categoryId: string }) => void
  onUsePrompt: (prompt: PmPrompt) => void
  onEditPrompt: (prompt: PmPrompt) => void
  onMovePrompt: (prompt: PmPrompt) => void
  onDeletePrompt: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const categoryPrompts = useMemo(
    () => prompts.filter((p) => p.categoryId === category.id).sort((a, b) => a.sortOrder - b.sortOrder),
    [prompts, category.id],
  )

  const toggle = useCallback(() => {
    if (!expanded) {
      setLoading(true)
      requestAnimationFrame(() => {
        setExpanded(true)
        setLoading(false)
      })
    } else {
      setExpanded(false)
    }
  }, [expanded])

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[12px] hover:bg-secondary/60 transition-colors cursor-pointer group/cat select-none"
          >
            <ChevronRight
              size={11}
              className={`shrink-0 text-muted-foreground/40 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
            />
            <Layers size={13} className="shrink-0 text-sky-500/60 dark:text-sky-400/60" />
            <span className="flex-1 text-left truncate text-foreground/75 font-medium text-[11.5px]">
              {category.name}
            </span>
            {category.isBuiltIn && <Lock size={10} className="shrink-0 text-muted-foreground/45" />}
            {loading && <AppLoaderGlyph size={10} className="shrink-0 text-muted-foreground/40" />}
            <span className="text-[10px] text-muted-foreground/30 tabular-nums opacity-0 group-hover/cat:opacity-100 transition-opacity">
              {categoryPrompts.length}
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {!category.isBuiltIn && (
            <ContextMenuItem onClick={() => onAddPrompt({ folderId: folder.id, categoryId: category.id })}>
              <Plus size={14} /> New Prompt
            </ContextMenuItem>
          )}
          {!category.isBuiltIn && (
            <ContextMenuItem onClick={() => onEditCategory(category)}>
              <Pencil size={14} /> Rename
            </ContextMenuItem>
          )}
          {!category.isBuiltIn && <ContextMenuSeparator />}
          {!category.isBuiltIn && (
            <ContextMenuItem
              className="text-destructive hover:text-destructive focus:text-destructive data-[highlighted]:text-destructive focus:bg-destructive/8 data-[highlighted]:bg-destructive/8 [&_svg]:text-destructive hover:[&_svg]:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:[&_svg]:text-destructive"
              onClick={() => onDeleteCategory(category.id)}
            >
              <Trash2 size={14} /> Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {expanded && (
        <div className="ml-3 pl-2 border-l border-border/20">
          {categoryPrompts.length === 0 ? (
            !category.isBuiltIn && (
              <button
                onClick={() => onAddPrompt({ folderId: folder.id, categoryId: category.id })}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] text-muted-foreground/30 hover:text-muted-foreground/50 hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <Plus size={10} /> Add prompt
              </button>
            )
          ) : (
            categoryPrompts.map((p) => (
              <PromptLeaf
                key={p.id}
                prompt={p}
                onClick={() => onSelectPrompt(p)}
                onUse={() => onUsePrompt(p)}
                onView={() => onSelectPrompt(p)}
                onEdit={() => onEditPrompt(p)}
                onMove={() => onMovePrompt(p)}
                onDelete={() => onDeletePrompt(p.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Prompt Leaf ────────────────────────────────────────────────

function PromptLeaf({
  prompt,
  onClick,
  onUse,
  onView,
  onEdit,
  onMove,
  onDelete,
}: {
  prompt: PmPrompt
  onClick: () => void
  onUse: () => void
  onView: () => void
  onEdit: () => void
  onMove: () => void
  onDelete: () => void
}) {
  const handleCopy = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    await navigator.clipboard.writeText(prompt.content)
    toast.success('Copied to clipboard')
  }, [prompt.content])

  const handleShare = useCallback(() => {
    sharePrompt(prompt)
  }, [prompt])

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          className="w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[11.5px] hover:bg-secondary/60 transition-colors cursor-pointer group/prompt select-none"
        >
          <FileText size={13} className="shrink-0 text-violet-500/50 dark:text-violet-400/50" />
          <span className="flex-1 text-left truncate text-foreground/65">
            {prompt.title}
          </span>
          {prompt.isBuiltIn && <Lock size={10} className="shrink-0 text-muted-foreground/45" />}
          <Tooltip content="Copy" side="bottom">
            <span
              role="button"
              onClick={(e) => handleCopy(e)}
              className="p-0.5 rounded-md hover:bg-background/80 transition-all cursor-pointer text-muted-foreground/40 hover:text-foreground opacity-0 group-hover/prompt:opacity-100"
            >
              <Copy size={11} />
            </span>
          </Tooltip>
        </button>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={onUse}>
          <MessageSquarePlus size={14} /> Use in Chat
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCopy()}>
          <Copy size={14} /> Copy Prompt
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onView}>
          <Eye size={14} /> View Details
        </ContextMenuItem>
        {!prompt.isBuiltIn && (
          <ContextMenuItem onClick={onEdit}>
            <Pencil size={14} /> Edit
          </ContextMenuItem>
        )}
        {!prompt.isBuiltIn && (
          <ContextMenuItem onClick={onMove}>
            <MoveRight size={14} /> Move to…
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={handleShare}>
          <Share2 size={14} /> Share
        </ContextMenuItem>
        {!prompt.isBuiltIn && <ContextMenuSeparator />}
        {!prompt.isBuiltIn && (
          <ContextMenuItem
            className="text-destructive hover:text-destructive focus:text-destructive data-[highlighted]:text-destructive focus:bg-destructive/8 data-[highlighted]:bg-destructive/8 [&_svg]:text-destructive hover:[&_svg]:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:[&_svg]:text-destructive"
            onClick={onDelete}
          >
            <Trash2 size={14} /> Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Main Tree ──────────────────────────────────────────────────

export function PmExplorerTree({
  folders,
  categories,
  prompts,
  onSelectPrompt,
  onEditFolder,
  onDeleteFolder,
  onEditCategory,
  onDeleteCategory,
  onAddCategory,
  onAddPrompt,
  onUsePrompt,
  onEditPrompt,
  onMovePrompt,
  onDeletePrompt,
}: PmExplorerTreeProps): React.JSX.Element {
  return (
    <div className="space-y-0.5">
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          categories={categories}
          prompts={prompts}
          onSelectPrompt={onSelectPrompt}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          onAddCategory={onAddCategory}
          onAddPrompt={onAddPrompt}
          onUsePrompt={onUsePrompt}
          onEditPrompt={onEditPrompt}
          onMovePrompt={onMovePrompt}
          onDeletePrompt={onDeletePrompt}
        />
      ))}
    </div>
  )
}
