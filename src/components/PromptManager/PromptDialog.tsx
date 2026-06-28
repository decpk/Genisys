import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Plus, ChevronDown, X } from 'lucide-react'
import { KeyMod, KeyCode } from 'monaco-editor'
import type * as monaco from 'monaco-editor'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { MarkdownEditorPreview } from '@/components/ui/markdown-editor-preview'
import { Tooltip } from '@/components/Tooltip'
import { usePromptManagerStore, type PmPrompt } from '@/store/prompt-manager-store'
import type { PromptScopeApp } from '@/lib/prompt-scope'

import { PromptScopeSelect } from './PromptScopeSelect'

interface PromptDialogProps {
  open: boolean
  prompt?: PmPrompt
  defaultCategoryId?: string
  defaultFolderId?: string
  onClose: () => void
}

const SELECT_TRIGGER_CLASS =
  'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent dark:bg-card px-3 py-1 text-sm shadow-xs transition-colors hover:border-primary/40 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/30 outline-none cursor-pointer'

export function PromptDialog(props: PromptDialogProps): React.JSX.Element {
  const { open, prompt, defaultCategoryId, defaultFolderId, onClose } = props

  const folders = usePromptManagerStore((s) => s.folders)
  const categories = usePromptManagerStore((s) => s.categories)
  const addPrompt = usePromptManagerStore((s) => s.addPrompt)
  const updatePrompt = usePromptManagerStore((s) => s.updatePrompt)
  const addFolder = usePromptManagerStore((s) => s.addFolder)
  const addCategory = usePromptManagerStore((s) => s.addCategory)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [folderId, setFolderId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [appScopes, setAppScopes] = useState<PromptScopeApp[]>([])

  // Inline create states
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderError, setFolderError] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')

  // Sync form state only when dialog opens (not on folders/categories change)
  useEffect(() => {
    if (open) {
      setTitle(prompt?.title ?? '')
      setDescription(prompt?.description ?? '')
      setContent(prompt?.content ?? '')
      setFolderId(prompt?.folderId ?? defaultFolderId ?? '')
      setCategoryId(prompt?.categoryId ?? defaultCategoryId ?? '')
      setAppScopes(prompt?.appScopes ?? [])
      setCreatingFolder(false)
      setNewFolderName('')
      setFolderError('')
      setCreatingCategory(false)
      setNewCategoryName('')
      setCategoryError('')
    }
  }, [open, prompt, defaultFolderId, defaultCategoryId])

  const folderCategories = useMemo(
    () => categories.filter((c) => c.folderId === folderId).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories, folderId],
  )

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
      }
    },
    [onClose],
  )

  const handleFolderChange = useCallback(
    (newFolderId: string) => {
      setFolderId(newFolderId)
      const firstCat = categories.find((c) => c.folderId === newFolderId)
      setCategoryId(firstCat?.id ?? '')
    },
    [categories],
  )

  const handleCategoryChange = useCallback(
    (newCategoryId: string) => {
      setCategoryId(newCategoryId)
    },
    [],
  )

  const folderLabel = useMemo(() => {
    if (!folderId) return 'Auto (Untitled)'
    return folders.find((f) => f.id === folderId)?.name ?? 'Auto (Untitled)'
  }, [folderId, folders])

  const categoryLabel = useMemo(() => {
    if (!categoryId) return 'Auto (General)'
    return folderCategories.find((c) => c.id === categoryId)?.name ?? 'Auto (General)'
  }, [categoryId, folderCategories])

  const folderItems = useMemo<DropdownItem[]>(() => {
    const items: DropdownItem[] = [
      {
        key: '__auto__',
        label: 'Auto (Untitled)',
        active: folderId === '',
        onSelect: () => handleFolderChange(''),
      },
      ...folders.map((f) => ({
        key: f.id,
        label: f.name,
        active: folderId === f.id,
        onSelect: () => handleFolderChange(f.id),
      })),
      {
        key: '__new__',
        label: 'New Folder',
        icon: Plus,
        onSelect: () => setCreatingFolder(true),
      },
    ]
    return items
  }, [folders, folderId, handleFolderChange])

  const categoryItems = useMemo<DropdownItem[]>(() => {
    const items: DropdownItem[] = [
      {
        key: '__auto__',
        label: 'Auto (General)',
        active: categoryId === '',
        onSelect: () => handleCategoryChange(''),
      },
      ...folderCategories.map((c) => ({
        key: c.id,
        label: c.name,
        active: categoryId === c.id,
        onSelect: () => handleCategoryChange(c.id),
      })),
    ]
    if (folderId) {
      items.push({
        key: '__new__',
        label: 'New Category',
        icon: Plus,
        onSelect: () => setCreatingCategory(true),
      })
    }
    return items
  }, [folderCategories, categoryId, folderId, handleCategoryChange])

  const handleCreateFolder = useCallback(async () => {
    const trimmed = newFolderName.trim()
    if (!trimmed) return
    const duplicate = folders.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) {
      setFolderError(`Folder "${trimmed}" already exists`)
      return
    }
    const folder = await addFolder(trimmed)
    setFolderId(folder.id)
    setCategoryId('')
    setCreatingFolder(false)
    setNewFolderName('')
    setFolderError('')
  }, [newFolderName, folders, addFolder])

  const handleCreateCategory = useCallback(async () => {
    const trimmed = newCategoryName.trim()
    if (!trimmed || !folderId) return
    const duplicate = categories.some((c) => c.folderId === folderId && c.name.toLowerCase() === trimmed.toLowerCase())
    if (duplicate) {
      setCategoryError(`Category "${trimmed}" already exists in this folder`)
      return
    }
    const cat = await addCategory(folderId, trimmed)
    setCategoryId(cat.id)
    setCreatingCategory(false)
    setNewCategoryName('')
    setCategoryError('')
  }, [newCategoryName, folderId, categories, addCategory])

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle || !trimmedContent) return

    if (prompt) {
      await updatePrompt(prompt.id, {
        title: trimmedTitle,
        content: trimmedContent,
        description: description.trim(),
        appScopes: appScopes.length > 0 ? appScopes : undefined,
      })
    } else {
      let resolvedFolderId = folderId
      let resolvedCategoryId = categoryId
      // Create folder/category on-demand only when saving the prompt
      if (!resolvedFolderId) {
        const folder = await addFolder('Untitled')
        resolvedFolderId = folder.id
      }
      if (!resolvedCategoryId) {
        const cat = await addCategory(resolvedFolderId, 'General')
        resolvedCategoryId = cat.id
      }
      await addPrompt(
        resolvedCategoryId,
        resolvedFolderId,
        trimmedTitle,
        trimmedContent,
        description.trim(),
        appScopes.length > 0 ? appScopes : undefined,
      )
    }
    onClose()
    setTitle('')
    setDescription('')
    setContent('')
  }, [title, description, content, folderId, categoryId, appScopes, prompt, addPrompt, updatePrompt, addFolder, addCategory, onClose])

  // Keep the latest save handler reachable from the Monaco Cmd+S
  // action, which only captures closures at editor-mount time.
  const handleSaveRef = useRef(handleSave)
  useEffect(() => {
    handleSaveRef.current = handleSave
  }, [handleSave])

  const handleEditorMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editor.addAction({
        id: 'prompt-dialog-save',
        label: 'Save Prompt',
        // eslint-disable-next-line no-bitwise
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        run: () => {
          void handleSaveRef.current()
        },
      })
    },
    [],
  )

  const isValid = Boolean(title.trim() && content.trim())
  const dialogTitle = prompt ? 'Edit Prompt' : 'New Prompt'

  let folderField: React.ReactNode = null
  if (creatingFolder) {
    folderField = (
      <>
        <div className="flex gap-1.5">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') {
                setCreatingFolder(false)
                setNewFolderName('')
                setFolderError('')
              }
            }}
            className="h-9"
          />
          <Button
            size="sm"
            className="h-9 px-2.5 shrink-0"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
          >
            <Plus size={14} />
          </Button>
        </div>
        {folderError && (
          <p className="text-[10px] text-destructive mt-1">{folderError}</p>
        )}
      </>
    )
  } else {
    folderField = (
      <Dropdown
        openOn="click"
        items={folderItems}
        side="bottom"
        align="left"
        showCheck
        fill
        maxHeight="260px"
        trigger={
          <button type="button" className={SELECT_TRIGGER_CLASS}>
            <span className="truncate text-left">{folderLabel}</span>
            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
        }
      />
    )
  }

  let categoryField: React.ReactNode = null
  if (creatingCategory) {
    categoryField = (
      <>
        <div className="flex gap-1.5">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateCategory()
              if (e.key === 'Escape') {
                setCreatingCategory(false)
                setNewCategoryName('')
                setCategoryError('')
              }
            }}
            className="h-9"
          />
          <Button
            size="sm"
            className="h-9 px-2.5 shrink-0"
            onClick={handleCreateCategory}
            disabled={!newCategoryName.trim()}
          >
            <Plus size={14} />
          </Button>
        </div>
        {categoryError && (
          <p className="text-[10px] text-destructive mt-1">{categoryError}</p>
        )}
      </>
    )
  } else {
    categoryField = (
      <Dropdown
        openOn="click"
        items={categoryItems}
        side="bottom"
        align="left"
        showCheck
        fill
        maxHeight="260px"
        trigger={
          <button type="button" className={SELECT_TRIGGER_CLASS}>
            <span className="truncate text-left">{categoryLabel}</span>
            <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
        }
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!w-[95vw] !h-[95vh] !max-w-none !max-h-none !p-0 !gap-0 flex flex-col overflow-hidden"
      >
        <DialogTitle className="sr-only">{dialogTitle}</DialogTitle>

        {/* ── Header ──────────────────────────────────────── */}
        <div className="shrink-0 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-5 pt-4">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                {dialogTitle}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Prompt title"
                autoFocus={!prompt}
                className="mt-1 h-10 border-transparent bg-transparent !text-base font-semibold focus-visible:border-input"
              />
            </div>
            <IconButton
              variant="default"
              size="md"
              onClick={onClose}
              tooltip="Close"
              tooltipSide="bottom"
            >
              <X size={16} />
            </IconButton>
          </div>

          <div className="px-5 pb-3 pt-2">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              className="h-9 text-sm"
            />
          </div>

          {!prompt && (
            <div className="grid grid-cols-2 gap-3 px-5 pb-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Folder
                </label>
                {folderField}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Category
                </label>
                {categoryField}
              </div>
            </div>
          )}

          <div className="px-5 pb-3">
            <PromptScopeSelect value={appScopes} onChange={setAppScopes} />
          </div>
        </div>

        {/* ── Editor + Preview (split, sync scroll) ─────── */}
        <MarkdownEditorPreview
          content={content}
          onChange={setContent}
          onEditorMount={handleEditorMount}
          leftPaneLabel="Markdown"
          rightPaneLabel="Preview"
          className="flex-1"
        />

        {/* ── Footer ──────────────────────────────────────── */}
        <div className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-sm px-5 py-3 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Tooltip content="Save (⌘S)" side="top">
            <Button onClick={handleSave} disabled={!isValid}>
              {prompt ? 'Save Changes' : 'Create Prompt'}
            </Button>
          </Tooltip>
        </div>
      </DialogContent>
    </Dialog>
  )
}
