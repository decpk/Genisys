import { useMemo } from 'react'
import { FileText, Plus, FolderPlus, Tag, Import } from "lucide-react";

import { PanelHeading } from '@/components/ui/panel-heading'
import { SearchInput } from '@/components/ui/search-input'
import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { MainEmptyState } from '@/components/ui/main-empty-state'
import { IconButton } from '@/components/ui/icon-button'

import { PromptDialog } from '@/components/PromptManager/PromptDialog'
import { CategoryDialog } from '@/components/PromptManager/CategoryDialog'
import { FolderDialog } from '@/components/PromptManager/FolderDialog'
import { MovePromptDialog } from '@/components/PromptManager/MovePromptDialog'
import { ImportDialog } from '@/components/PromptManager/ImportDialog'

import { PmExplorerTree } from './components/PmExplorerTree'
import { PmPromptCard } from './components/PmPromptCard'
import { PmPromptViewerDialog } from './components/PmPromptViewerDialog'
import { usePromptsPanel } from './PromptsPanel.hooks'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

export function PromptsPanel(): React.JSX.Element {
  const {
    folders,
    categories,
    prompts,
    isLoaded,
    searchQuery,
    filteredPrompts,
    totalCount,
    setSearchQuery,
    dialogs,
    openPromptDialog,
    openFolderDialog,
    openCategoryDialog,
    openMoveDialog,
    openImportDialog,
    openViewerDialog,
    closeDialog,
    handleUse,
    removeFolder,
    removeCategory,
    removePrompt,
  } = usePromptsPanel()

  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const confirmRemoveFolder = (id: string) => {
    openConfirmDialog({
      title: 'Delete folder',
      description: 'Are you sure you want to delete this folder and all its contents? This action cannot be undone.',
      onConfirm: () => removeFolder(id),
    })
  }

  const confirmRemoveCategory = (id: string) => {
    openConfirmDialog({
      title: 'Delete category',
      description: 'Are you sure you want to delete this category and all its prompts? This action cannot be undone.',
      onConfirm: () => removeCategory(id),
    })
  }

  const confirmRemovePrompt = (id: string) => {
    openConfirmDialog({
      title: 'Delete prompt',
      description: 'Are you sure you want to delete this prompt? This action cannot be undone.',
      onConfirm: () => removePrompt(id),
    })
  }

  const addMenuItems = useMemo<DropdownItem[]>(
    () => [
      { key: 'prompt', label: 'New Prompt', icon: Plus, onSelect: () => openPromptDialog() },
      { key: 'category', label: 'New Category', icon: Tag, onSelect: () => openCategoryDialog() },
      { key: 'folder', label: 'New Folder', icon: FolderPlus, onSelect: () => openFolderDialog() },
    ],
    [openPromptDialog, openCategoryDialog, openFolderDialog],
  )

  const isSearching = !!searchQuery.trim()

  // ── Loading state ────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="flex flex-col h-full">
        <PanelHeading icon={FileText} title="Prompts" />
        <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <PanelHeading icon={FileText} title="Prompts" count={totalCount} className="px-3 h-9">
        <IconButton
          size="sm"
          variant="ghost"
          tooltip="Import"
          onClick={openImportDialog}
        >
          <Import size={14} />
        </IconButton>
        <Dropdown
          items={addMenuItems}
          trigger={<Plus size={14} />}
          triggerProps={{ tooltip: 'Add', size: 'sm' }}
          align="right"
          openOn="click"
        />
      </PanelHeading>

      {/* ── Search ──────────────────────────────────────────── */}
      {prompts.length > 0 && (
        <div className="px-2 pb-1.5">
          <SearchInput
            placeholder="Search prompts…"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto px-1 pb-2">
        {isSearching ? (
          /* ── Search results ─────────────────────────────── */
          filteredPrompts.length === 0 ? (
            <MainEmptyState
              icon={FileText}
              title="No matches"
              description="Try a different search term"
            />
          ) : (
            <div className="space-y-1 px-1">
              {filteredPrompts.map((p) => (
                <PmPromptCard
                  key={p.id}
                  prompt={p}
                  categoryName={categories.find((c) => c.id === p.categoryId)?.name}
                  folderColor={folders.find((f) => f.id === p.folderId)?.color}
                  onUse={handleUse}
                  onView={openViewerDialog}
                  onEdit={(pr) => openPromptDialog({ prompt: pr })}
                  onMove={openMoveDialog}
                  onDelete={confirmRemovePrompt}
                />
              ))}
            </div>
          )
        ) : folders.length === 0 && prompts.length === 0 ? (
          /* ── Empty state ────────────────────────────────── */
          <MainEmptyState
            icon={FileText}
            title="No prompts yet"
            description="Create your first prompt to get started"
          >
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
              onClick={() => openPromptDialog()}
            >
              <Plus size={13} /> Create Prompt
            </button>
          </MainEmptyState>
        ) : (
          /* ── Explorer tree ──────────────────────────────── */
          <PmExplorerTree
            folders={folders}
            categories={categories}
            prompts={prompts}
            onSelectPrompt={openViewerDialog}
            onEditFolder={(f) => openFolderDialog(f)}
            onDeleteFolder={confirmRemoveFolder}
            onEditCategory={(cat) => openCategoryDialog(cat.folderId, cat)}
            onDeleteCategory={confirmRemoveCategory}
            onAddCategory={(folderId) => openCategoryDialog(folderId)}
            onAddPrompt={({ folderId, categoryId }) =>
              openPromptDialog({ folderId, categoryId })
            }
            onUsePrompt={handleUse}
            onEditPrompt={(pr) => openPromptDialog({ prompt: pr })}
            onMovePrompt={openMoveDialog}
            onDeletePrompt={confirmRemovePrompt}
          />
        )}
      </div>

      {/* ── Dialogs ─────────────────────────────────────────── */}
      <PromptDialog
        open={dialogs.promptDialog.open}
        prompt={dialogs.promptDialog.prompt}
        defaultCategoryId={dialogs.promptDialog.categoryId}
        defaultFolderId={dialogs.promptDialog.folderId}
        onClose={() => closeDialog('promptDialog')}
      />
      <FolderDialog
        open={dialogs.folderDialog.open}
        folder={dialogs.folderDialog.folder}
        onClose={() => closeDialog('folderDialog')}
      />
      <CategoryDialog
        open={dialogs.categoryDialog.open}
        folderId={dialogs.categoryDialog.folderId}
        category={dialogs.categoryDialog.category}
        onClose={() => closeDialog('categoryDialog')}
      />
      <MovePromptDialog
        open={dialogs.moveDialog.open}
        prompt={dialogs.moveDialog.prompt}
        onClose={() => closeDialog('moveDialog')}
      />
      <ImportDialog
        open={dialogs.importDialog}
        onClose={() => closeDialog('importDialog')}
      />
      <PmPromptViewerDialog
        open={dialogs.viewerDialog.open}
        prompt={dialogs.viewerDialog.prompt}
        onOpenChange={(open) => { if (!open) closeDialog('viewerDialog') }}
        onEdit={(pr) => openPromptDialog({ prompt: pr })}
        onMove={openMoveDialog}
        onUse={handleUse}
      />
    </div>
  )
}
