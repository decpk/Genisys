import { useCallback } from 'react'
import { Copy, Eye, Pencil, Trash2, MoveRight, Share2, MessageSquarePlus, Lock } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import type { PmPrompt } from '@/store/prompt-manager-store'
import { sharePrompt } from '@/components/PromptManager/pm-share'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

interface PmPromptCardProps {
  prompt: PmPrompt
  folderColor?: string
  categoryName?: string
  onUse: (prompt: PmPrompt) => void
  onView: (prompt: PmPrompt) => void
  onEdit: (prompt: PmPrompt) => void
  onMove: (prompt: PmPrompt) => void
  onDelete: (id: string) => void
}

export function PmPromptCard({
  prompt,
  folderColor,
  categoryName,
  onUse,
  onView,
  onEdit,
  onMove,
  onDelete,
}: PmPromptCardProps): React.JSX.Element {
  const handleCopy = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    await navigator.clipboard.writeText(prompt.content)
    toast.success('Copied to clipboard')
  }, [prompt.content])

  const handleShare = useCallback(() => {
    sharePrompt(prompt)
  }, [prompt])

  const contentPreview =
    prompt.content.length > 100 ? prompt.content.slice(0, 100) + '…' : prompt.content

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="group/card relative flex items-start gap-2.5 px-2.5 py-2 rounded-xl bg-card/40 hover:bg-card border border-transparent hover:border-border/30 cursor-pointer transition-all duration-150 hover:shadow-sm"
          onClick={() => onUse(prompt)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onView(prompt);
          }}
        >
          {/* Folder color accent */}
          {folderColor && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 rounded-r-full opacity-50"
              style={{ backgroundColor: folderColor }}
            />
          )}

          <div className="flex-1 min-w-0 space-y-1">
            {/* Row 1: Title + pin */}
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-foreground truncate flex-1">
                {prompt.title}
              </span>
            </div>

            {/* Row 2: Description or content preview */}
            <Tooltip
              content={prompt.content}
              side="left"
              className="max-w-xs whitespace-pre-wrap"
              interactive
            >
              <p className="text-[10px] text-muted-foreground/50 line-clamp-2 leading-relaxed select-none">
                {prompt.description || contentPreview}
              </p>
            </Tooltip>

            {/* Row 3: Category badge */}
            {categoryName && (
              <span className="inline-flex text-[9px] text-muted-foreground/40 bg-muted/40 rounded-full px-1.5 py-px font-medium">
                {categoryName}
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div
            className="shrink-0 flex items-center gap-px opacity-0 group-hover/card:opacity-100 transition-opacity duration-100 mt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip content="Copy" side="bottom">
              <button
                onClick={() => handleCopy()}
                className="p-1 rounded-md hover:bg-background/80 transition-colors cursor-pointer text-muted-foreground/40 hover:text-foreground"
              >
                <Copy size={11} />
              </button>
            </Tooltip>
            {!prompt.isBuiltIn && (
              <Tooltip content="Edit" side="bottom">
                <button
                  onClick={() => onEdit(prompt)}
                  className="p-1 rounded-md hover:bg-background/80 transition-colors cursor-pointer text-muted-foreground/40 hover:text-foreground"
                >
                  <Pencil size={11} />
                </button>
              </Tooltip>
            )}
            {!prompt.isBuiltIn && (
              <Tooltip content="Delete" side="bottom">
                <button
                  onClick={() => onDelete(prompt.id)}
                  className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer text-muted-foreground/40"
                >
                  <Trash2 size={11} />
                </button>
              </Tooltip>
            )}
            {prompt.isBuiltIn && (
              <Tooltip content="Built-in prompt" side="bottom">
                <span className="p-1 rounded-md text-muted-foreground/40">
                  <Lock size={11} />
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => onUse(prompt)}>
          <MessageSquarePlus size={14} /> Use in Chat
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleCopy()}>
          <Copy size={14} /> Copy Prompt
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onView(prompt)}>
          <Eye size={14} /> View Details
        </ContextMenuItem>
        {!prompt.isBuiltIn && (
          <ContextMenuItem onClick={() => onEdit(prompt)}>
            <Pencil size={14} /> Edit
          </ContextMenuItem>
        )}
        {!prompt.isBuiltIn && (
          <ContextMenuItem onClick={() => onMove(prompt)}>
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
            onClick={() => onDelete(prompt.id)}
          >
            <Trash2 size={14} /> Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
