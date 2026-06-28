import { useMemo } from 'react'
import {
  Copy,
  Lock,
  MoreHorizontal,
  Move,
  Pencil,
  Pin,
  Trash2,
} from 'lucide-react'

import { Dropdown, type DropdownItem } from '@/components/ui/dropdown'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'
import type { PmPrompt } from '@/store/prompt-manager-store'
import { usePromptsAppTabsStore } from '@/store/prompts-app-tabs-store'

import { formatPromptCardDate } from '../utils/formatPromptCardDate'
import type { PromptsAppData } from '../PromptsApp.types'

interface PromptsAppPromptCardProps {
  prompt: PmPrompt
  data: PromptsAppData
}

export function PromptsAppPromptCard(
  props: PromptsAppPromptCardProps,
): React.JSX.Element {
  const { prompt, data } = props
  const {
    folders,
    categories,
    openPromptDialog,
    openMoveDialog,
    handleCopyPrompt,
    removePrompt,
  } = data
  // Selecting only the stable action keeps the card from re-rendering on
  // every tab-store mutation.
  const openPromptTab = usePromptsAppTabsStore((s) => s.openPromptTab)

  const folder = folders.find((f) => f.id === prompt.folderId)
  const category = categories.find((c) => c.id === prompt.categoryId)

  const { preview, wordCount } = useMemo(() => {
    const trimmed = prompt.content.trim()
    const raw = (prompt.description?.trim() || trimmed).replace(/\s+/g, ' ')
    const previewText =
      raw.length > 240 ? raw.slice(0, 240).trimEnd() + '…' : raw
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0
    return { preview: previewText, wordCount: words }
  }, [prompt.description, prompt.content])

  const isBuiltIn = !!prompt.isBuiltIn
  const updatedLabel = formatPromptCardDate(prompt.updatedAt)
  const wordLabel = `${wordCount.toLocaleString()} ${wordCount === 1 ? 'word' : 'words'}`

  const overflowItems = useMemo<DropdownItem[]>(() => {
    const items: DropdownItem[] = []
    if (!isBuiltIn) {
      items.push({
        key: 'edit',
        label: 'Edit',
        icon: Pencil,
        onSelect: () => openPromptDialog({ prompt }),
      })
      items.push({
        key: 'move',
        label: 'Move…',
        icon: Move,
        onSelect: () => openMoveDialog(prompt),
      })
    }
    items.push({
      key: 'copy',
      label: 'Copy content',
      icon: Copy,
      onSelect: () => {
        void handleCopyPrompt(prompt)
      },
    })
    items.push({
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      destructive: true,
      onSelect: () => removePrompt(prompt.id),
    })
    return items
  }, [
    isBuiltIn,
    prompt,
    openPromptDialog,
    openMoveDialog,
    handleCopyPrompt,
    removePrompt,
  ])

  return (
    <article
      onClick={() => openPromptTab(prompt.id)}
      className={cn(
        'group/card relative isolate flex cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl border border-border/40 bg-card p-5',
        'transition-[transform,border-color,box-shadow] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-primary/25',
        'hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.18),0_6px_12px_-6px_rgba(0,0,0,0.08)]',
      )}
    >
      {/* Soft top-tinted gradient — gives the card warmth without being loud */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-primary/[0.05] to-transparent"
      />

      {/* Soft hover glow in the top-left */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 -z-10 size-36 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover/card:opacity-100"
      />

      {/* Hover-only hairline accent across the top */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
      />

      {/* Meta row — pill badges + status indicators */}
      <div className="relative flex min-w-0 items-center gap-1.5">
        <span className="inline-flex max-w-[50%] items-center gap-1.5 truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-medium text-primary">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="truncate">{folder?.name ?? 'Library'}</span>
        </span>
        {category ? (
          <span className="inline-flex min-w-0 items-center gap-1 truncate rounded-full bg-muted/60 px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
            {category.icon ? (
              <span aria-hidden className="shrink-0 text-[11px] leading-none">
                {category.icon}
              </span>
            ) : null}
            <span className="truncate">{category.name}</span>
          </span>
        ) : null}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {prompt.isPinned ? (
            <Pin
              size={11}
              className="text-amber-500"
              strokeWidth={2.5}
              aria-label="Pinned"
            />
          ) : null}
          {isBuiltIn ? (
            <Lock
              size={11}
              className="text-muted-foreground/60"
              strokeWidth={2.5}
              aria-label="Built-in"
            />
          ) : null}
        </span>
      </div>

      {/* Title */}
      <h3 className="relative line-clamp-2 text-[15.5px] font-semibold leading-[1.3] tracking-[-0.01em] text-foreground">
        {prompt.title || 'Untitled prompt'}
      </h3>

      {/* Preview */}
      <p
        className={cn(
          'relative line-clamp-3 text-[13px] leading-[1.55] text-muted-foreground',
          !preview && 'italic text-muted-foreground/60',
        )}
      >
        {preview || 'No content yet.'}
      </p>

      {/* Footer — hairline divider, meta on left, actions on right */}
      <div
        className="relative mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground/70">
          {updatedLabel ? <span className="truncate">{updatedLabel}</span> : null}
          {updatedLabel ? (
            <span aria-hidden className="text-muted-foreground/30">·</span>
          ) : null}
          <span className="shrink-0">{wordLabel}</span>
        </div>
        <div className="-mr-1 flex shrink-0 items-center gap-0.5">
          <IconButton
            tooltip="Copy content"
            onClick={() => void handleCopyPrompt(prompt)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground/50 hover:bg-muted/60 hover:text-foreground"
          >
            <Copy size={14} />
          </IconButton>
          {!isBuiltIn ? (
            <IconButton
              tooltip="Edit"
              onClick={() => openPromptDialog({ prompt })}
              variant="ghost"
              size="sm"
              className="text-muted-foreground/50 hover:bg-muted/60 hover:text-foreground"
            >
              <Pencil size={14} />
            </IconButton>
          ) : null}
          <Dropdown
            items={overflowItems}
            align="right"
            openOn="click"
            menuWidth="w-44"
            trigger={<MoreHorizontal size={14} />}
            triggerProps={{
              tooltip: 'More actions',
              variant: 'ghost',
              size: 'sm',
              className:
                'text-muted-foreground/50 hover:bg-muted/60 hover:text-foreground',
            }}
          />
        </div>
      </div>
    </article>
  )
}
