import { useCallback, useEffect, useMemo, useState } from 'react'
import { Scissors, Trash2, Pencil, Copy, Heart, Plus, Search, Star, Zap, MessageSquare, ExternalLink, ChevronDown, Code, FileText } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')

import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { SearchInput } from '@/components/ui/search-input'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Tooltip } from '@/components/Tooltip'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { relativeTime } from '@/lib/format'
import { useSnippetsStore, type Snippet } from '@/store/snippets-store'
import { useChatHistoryStore } from '@/store/chat-history-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useInsertSnippet } from '../../InsertSnippetContext'

type FilterMode = 'all' | 'favorites'

export function SnippetsPanel(): React.JSX.Element {
  const onInsertSnippet = useInsertSnippet()
  const snippets = useSnippetsStore((s) => s.snippets)
  const isLoaded = useSnippetsStore((s) => s.isLoaded)
  const loadSnippets = useSnippetsStore((s) => s.loadSnippets)
  const removeSnippet = useSnippetsStore((s) => s.removeSnippet)
  const toggleFavorite = useSnippetsStore((s) => s.toggleFavorite)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)

  useEffect(() => {
    if (!isLoaded) loadSnippets()
  }, [isLoaded, loadSnippets])

  const filtered = useMemo(() => {
    let list = snippets
    if (filter === 'favorites') list = list.filter((s) => s.isFavorite)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
      )
    }
    return list
  }, [snippets, filter, search])

  const handleEdit = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet)
    setDialogOpen(true)
  }, [])

  const handleCreate = useCallback(() => {
    setEditingSnippet(null)
    setDialogOpen(true)
  }, [])

  const handleUse = useCallback(
    (snippet: Snippet) => {
      onInsertSnippet?.(snippet.content)
      toast.success('Snippet inserted', { duration: 1500 })
    },
    [onInsertSnippet]
  )

  const handleCopy = useCallback((snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.content)
    toast.success('Copied to clipboard', { duration: 1500 })
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      openConfirmDialog({
        title: 'Delete snippet',
        description: 'Are you sure you want to delete this snippet? This action cannot be undone.',
        onConfirm: () => {
          removeSnippet(id)
          toast.success('Snippet deleted', { duration: 1500 })
        },
      })
    },
    [removeSnippet, openConfirmDialog]
  )

  const showFilterBar = snippets.length > 0

  return (
    <div className="flex flex-col h-full">
      <PanelHeading icon={Scissors} title="Snippets" count={snippets.length} className="px-3 h-9">
        <IconButton tooltip="New Snippet" tooltipSide="bottom" size="sm" onClick={handleCreate}>
          <Plus size={14} />
        </IconButton>
      </PanelHeading>

      {showFilterBar && (
        <SnippetFilterBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <SnippetListContent
          isLoaded={isLoaded}
          filtered={filtered}
          totalCount={snippets.length}
          onUse={handleUse}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      <SnippetFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSnippet={editingSnippet}
      />
    </div>
  )
}

// ── Filter Bar ───────────────────────────────────────────────────

function SnippetFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: {
  search: string
  onSearchChange: (v: string) => void
  filter: FilterMode
  onFilterChange: (f: FilterMode) => void
}): React.JSX.Element {
  const allClassName =
    filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
  const favClassName =
    filter === 'favorites' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'

  return (
    <div className="px-3 pb-2 space-y-2">
      <SearchInput placeholder="Search snippets..." value={search} onChange={onSearchChange} />
      <div className="flex gap-1">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-2 py-0.5 text-xs rounded-md transition-colors cursor-pointer ${allClassName}`}
        >
          All
        </button>
        <button
          onClick={() => onFilterChange('favorites')}
          className={`px-2 py-0.5 text-xs rounded-md transition-colors cursor-pointer flex items-center gap-1 ${favClassName}`}
        >
          <Star size={10} />
          Favorites
        </button>
      </div>
    </div>
  )
}

// ── List Content ─────────────────────────────────────────────────

function SnippetListContent({
  isLoaded,
  filtered,
  totalCount,
  onUse,
  onCopy,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  isLoaded: boolean
  filtered: Snippet[]
  totalCount: number
  onUse: (s: Snippet) => void
  onCopy: (s: Snippet) => void
  onEdit: (s: Snippet) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}): React.JSX.Element {
  if (!isLoaded) {
    return <p className="text-xs text-muted-foreground text-center py-8">Loading…</p>
  }
  if (totalCount === 0) {
    return (
      <EmptyState
        message="No snippets yet. Select text in chat to save one!"
        icon={Scissors}
        className="py-12"
      />
    )
  }
  if (filtered.length === 0) {
    return <EmptyState message="No snippets match your search" icon={Search} className="py-12" />
  }
  return (
    <div className="space-y-2">
      {filtered.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onUse={onUse}
          onCopy={onCopy}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

// ── Snippet Card (matches PromptCard style) ──────────────────────

function SnippetCard({
  snippet,
  onUse,
  onCopy,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  snippet: Snippet
  onUse: (s: Snippet) => void
  onCopy: (s: Snippet) => void
  onEdit: (s: Snippet) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}): React.JSX.Element {
  const conversations = useChatHistoryStore((s) => s.conversations)
  const selectConversation = useChatHistoryStore((s) => s.selectConversation)
  const conversation = snippet.conversationId
    ? conversations.find((c) => c.id === snippet.conversationId) ?? null
    : null
  const conversationMissing = snippet.conversationId != null && conversation == null

  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<'parsed' | 'raw'>('parsed')

  return (
    <div
      className="group/card relative rounded-lg border border-border/40 bg-card hover:border-border/70 transition-colors duration-150 cursor-pointer overflow-hidden"
      onClick={() => onUse(snippet)}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-1.5 min-h-[28px] px-2.5 py-1.5 bg-muted/30 border-b border-border/20">
        <IconButton
          variant="ghost"
          size="xs"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((prev) => !prev)
          }}
          className="text-muted-foreground/50"
        >
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
          />
        </IconButton>
        {snippet.isFavorite && (
          <Zap size={10} className="text-amber-400 fill-amber-400 shrink-0" />
        )}
        <span className="text-xs font-medium text-foreground truncate flex-1 min-w-0">
          {snippet.title}
        </span>

        {conversation && (
          <IconButton
            variant="ghost"
            size="xs"
            tooltip={conversation.title}
            tooltipSide="bottom"
            onClick={(e) => {
              e.stopPropagation()
              selectConversation(snippet.conversationId!)
              toast.success('Switched to conversation', { duration: 1500 })
            }}
            className="text-muted-foreground/50 hover:text-primary shrink-0"
          >
            <ExternalLink size={11} />
          </IconButton>
        )}
        {conversationMissing && (
          <Tooltip content="Conversation deleted" side="bottom">
            <span className="p-1 text-destructive/50 shrink-0">
              <MessageSquare size={11} />
            </span>
          </Tooltip>
        )}
      </div>

      {/* ── Content ── */}
      <div className={`px-2.5 py-3 text-muted-foreground/60 select-none overflow-y-auto ${expanded ? 'max-h-64' : 'max-h-24'}`}>
        {viewMode === 'parsed' ? (
          <MarkdownRenderer content={snippet.content} variant="compact" />
        ) : (
          <pre className="text-xs whitespace-pre-wrap font-mono">{snippet.content}</pre>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center gap-1 px-2.5 py-1.5 bg-muted/20 border-t border-border/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Actions - visible on hover only */}
        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-100">
          {/* Raw / Parsed toggle */}
          <div className="flex items-center rounded-sm border border-border/40 overflow-hidden">
            <Tooltip content="Parsed" side="bottom">
              <button
              onClick={() => setViewMode('parsed')}
              className={`p-1 transition-colors cursor-pointer ${
                viewMode === 'parsed'
                  ? 'text-foreground bg-secondary/80'
                  : 'text-muted-foreground/50 hover:text-foreground'
              }`}
            >
              <FileText size={11} />
            </button>
          </Tooltip>
          <Tooltip content="Raw" side="bottom">
            <button
              onClick={() => setViewMode('raw')}
              className={`p-1 transition-colors cursor-pointer border-l border-border/40 ${
                viewMode === 'raw'
                  ? 'text-foreground bg-secondary/80'
                  : 'text-muted-foreground/50 hover:text-foreground'
              }`}
            >
              <Code size={11} />
            </button>
          </Tooltip>
        </div>

        <IconButton
          variant="ghost"
          size="xs"
          tooltip={snippet.isFavorite ? 'Unfavorite' : 'Favorite'}
          tooltipSide="bottom"
          onClick={() => onToggleFavorite(snippet.id)}
        >
          <Heart
            size={11}
            className={
              snippet.isFavorite
                ? 'text-rose-400 fill-rose-400'
                : 'text-muted-foreground/50 hover:text-rose-400'
            }
          />
        </IconButton>
        <IconButton variant="ghost" size="xs" tooltip="Copy" tooltipSide="bottom" onClick={() => onCopy(snippet)}>
          <Copy size={11} />
        </IconButton>
        <IconButton variant="ghost" size="xs" tooltip="Edit" tooltipSide="bottom" onClick={() => onEdit(snippet)}>
          <Pencil size={11} />
        </IconButton>
        <IconButton variant="destructive" size="xs" tooltip="Delete" tooltipSide="bottom" onClick={() => onDelete(snippet.id)}>
          <Trash2 size={11} />
        </IconButton>
        </div>

        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground/35">
          {relativeTime(snippet.updatedAt)}
        </span>
      </div>
    </div>
  )
}

// ── Form Dialog ──────────────────────────────────────────────────

function SnippetFormDialog({
  open,
  onOpenChange,
  editingSnippet,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSnippet: Snippet | null
}): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {open && (
          <SnippetForm
            editingSnippet={editingSnippet}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SnippetForm({
  editingSnippet,
  onClose,
}: {
  editingSnippet: Snippet | null
  onClose: () => void
}): React.JSX.Element {
  const addSnippet = useSnippetsStore((s) => s.addSnippet)
  const updateSnippet = useSnippetsStore((s) => s.updateSnippet)

  const [title, setTitle] = useState(editingSnippet?.title ?? '')
  const [content, setContent] = useState(editingSnippet?.content ?? '')

  const isValid = title.trim().length > 0 && content.trim().length > 0

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!isValid) return
    if (editingSnippet) {
      updateSnippet(editingSnippet.id, { title: title.trim(), content: content.trim() })
      toast.success('Snippet updated', { duration: 1500 })
    } else {
      addSnippet(title.trim(), content.trim())
      toast.success('Snippet created', { duration: 1500 })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {editingSnippet ? 'Edit Snippet' : 'New Snippet'}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {editingSnippet ? 'Update this snippet.' : 'Create a reusable text snippet.'}
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Snippet title…"
            className="w-full text-sm bg-transparent border border-transparent rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground focus:border-input focus:ring-1 focus:ring-ring/20"
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Snippet content…"
            rows={6}
            className="w-full text-sm bg-transparent border border-transparent rounded-lg px-3 py-2 outline-none resize-none text-foreground placeholder:text-muted-foreground focus:border-input focus:ring-1 focus:ring-ring/20"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="xs" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" size="xs" type="submit" disabled={!isValid}>
          {editingSnippet ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
