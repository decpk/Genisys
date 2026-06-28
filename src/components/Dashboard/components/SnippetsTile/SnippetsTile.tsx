import { useEffect, useRef, useState } from 'react'
import {
  Scissors, MessageSquare, Copy, Heart, Trash2, ExternalLink, Zap,
  GripVertical,
} from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('chat')

import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { EmptyState } from '@/components/ui/empty-state'
import { relativeTime } from '@/lib/format'
import { useSnippetsStore, type Snippet } from '@/store/snippets-store'
import { useChatHistoryStore } from '@/store/chat-history-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useNavigationStore } from '@/store/navigation-store'
import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../SortableTile/SortableTile.types'
import { TileResizeMenu } from '../TileResizeMenu'
import { TileHeading } from '../TileHeading'

const PAGE_SIZE = 10

interface SnippetsTileProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
}

export function SnippetsTile({ tileWidth, onWidthChange, dragHandleProps }: SnippetsTileProps): React.JSX.Element {
  const snippets = useSnippetsStore((s) => s.snippets)
  const isLoaded = useSnippetsStore((s) => s.isLoaded)
  const loadSnippets = useSnippetsStore((s) => s.loadSnippets)
  const removeSnippet = useSnippetsStore((s) => s.removeSnippet)
  const toggleFavorite = useSnippetsStore((s) => s.toggleFavorite)
  const conversations = useChatHistoryStore((s) => s.conversations)
  const openConversation = useNavigationStore((s) => s.openConversation)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoaded) loadSnippets()
  }, [isLoaded, loadSnippets])

  const visibleSnippets = snippets.slice(0, visibleCount)
  const hasMore = visibleCount < snippets.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    const scrollContainer = scrollRef.current
    if (!sentinel || !scrollContainer || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, snippets.length))
        }
      },
      { root: scrollContainer, threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, snippets.length])

  const handleOpenConversation = (snippet: Snippet): void => {
    if (!snippet.conversationId) return
    const exists = conversations.some((c) => c.id === snippet.conversationId)
    if (exists) {
      openConversation(snippet.conversationId)
    } else {
      toast.error('This conversation no longer exists', { duration: 2000 })
    }
  }

  const handleCopy = (snippet: Snippet): void => {
    navigator.clipboard.writeText(snippet.content)
    toast.success('Copied to clipboard', { duration: 1500 })
  }

  const handleDelete = (id: string): void => {
    openConfirmDialog({
      title: 'Delete snippet',
      description: 'Are you sure you want to delete this snippet? This action cannot be undone.',
      onConfirm: () => {
        removeSnippet(id)
        toast.success('Snippet deleted', { duration: 1500 })
      },
    })
  }

  if (!isLoaded) return <div />

  return (
    <div className="@container group relative border border-border rounded-lg bg-card overflow-hidden h-[400px] flex flex-col">
      {/* Action buttons — top-right, shown on hover */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header */}
      <TileHeading
        icon={Scissors}
        title="Snippets"
        appId="chat"
        appLabel="Open Chat"
        count={snippets.length > 0 ? snippets.length : undefined}
      />

      {/* Content */}
      {snippets.length === 0 ? (
        <div className="p-4 flex-1 flex items-center justify-center">
          <EmptyState
            message="No snippets yet. Select text in chat to save one!"
            icon={Scissors}
            className="py-6"
          />
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2">
          {visibleSnippets.map((snippet) => {
            const conversation = snippet.conversationId
              ? conversations.find((c) => c.id === snippet.conversationId) ?? null
              : null
            const conversationMissing = snippet.conversationId != null && conversation == null

            return (
              <div
                key={snippet.id}
                className="group/item rounded-lg border border-transparent bg-secondary/30 hover:bg-secondary/60 transition-colors duration-150 cursor-pointer"
              >
                <div className="px-2.5 py-1.5 space-y-1">
                  {/* Row 1: Heading + actions (shown on card hover) */}
                  <div className="flex items-center gap-1.5 min-h-[20px]">
                    {snippet.isFavorite && (
                      <Zap
                        size={10}
                        className="text-amber-400 fill-amber-400 shrink-0"
                      />
                    )}
                    <span className="text-xs font-medium text-foreground truncate flex-1 min-w-0">
                      {snippet.title}
                    </span>
                    <div className="flex items-center gap-px shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-100">
                      {snippet.conversationId && !conversationMissing && (
                        <Tooltip content="Open conversation" side="bottom">
                          <IconButton
                            onClick={() => handleOpenConversation(snippet)}
                            variant="ghost"
                            size="xs"
                          >
                            <ExternalLink size={11} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip
                        content={snippet.isFavorite ? "Unfavorite" : "Favorite"}
                        side="bottom"
                      >
                        <IconButton
                          onClick={() => toggleFavorite(snippet.id)}
                          variant="ghost"
                          size="xs"
                        >
                          <Heart
                            size={11}
                            className={
                              snippet.isFavorite
                                ? "text-rose-400 fill-rose-400"
                                : "text-muted-foreground/50 hover:text-rose-400"
                            }
                          />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Copy" side="bottom">
                        <IconButton
                          onClick={() => handleCopy(snippet)}
                          variant="ghost"
                          size="xs"
                        >
                          <Copy size={11} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete" side="bottom">
                        <IconButton
                          onClick={() => handleDelete(snippet.id)}
                          variant="destructive"
                          size="xs"
                        >
                          <Trash2 size={11} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Row 2: Content (full width) */}
                  <p className="text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed select-none">
                    {snippet.content}
                  </p>

                  {/* Row 3: Chat heading */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {conversation && (
                      <button
                        onClick={() => handleOpenConversation(snippet)}
                        className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50 hover:text-primary truncate max-w-[60%] transition-colors cursor-pointer"
                      >
                        <ExternalLink size={8} className="shrink-0" />
                        {conversation.title}
                      </button>
                    )}
                    {conversationMissing && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive/50 truncate max-w-[60%]">
                        <MessageSquare size={8} className="shrink-0" />
                        Conversation deleted
                      </span>
                    )}
                    <div className="flex-1" />
                    <span className="text-[10px] text-muted-foreground/35">
                      {relativeTime(snippet.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center py-2">
              <span className="text-[10px] text-muted-foreground/40">Loading more…</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
