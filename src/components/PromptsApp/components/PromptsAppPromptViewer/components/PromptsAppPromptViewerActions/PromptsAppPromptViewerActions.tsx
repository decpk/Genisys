import {
  Copy,
  MoveRight,
  Pencil,
  Share2,
  Trash2,
} from 'lucide-react'

import type { PromptsAppPromptViewerActionsProps } from './PromptsAppPromptViewerActions.types'

/**
 * Primary action row beneath the viewer title. Mirrors the action set
 * from the legacy `PmPromptViewerDialog`: Copy, Share, and — only for
 * user prompts — Edit / Move / Delete.
 */
export function PromptsAppPromptViewerActions(
  props: PromptsAppPromptViewerActionsProps,
): React.JSX.Element {
  const {
    prompt,
    onCopy,
    onShare,
    onEdit,
    onMove,
    onRequestDelete,
  } = props

  const showAuthorActions = !prompt.isBuiltIn

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={() => onCopy(prompt)}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/40 px-2 py-1.5 text-[11px] font-medium text-foreground/80 transition-all hover:bg-secondary/50 hover:text-foreground"
      >
        <Copy size={11} /> Copy
      </button>
      <button
        onClick={() => onShare(prompt)}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/40 px-2 py-1.5 text-[11px] font-medium text-foreground/80 transition-all hover:bg-secondary/50 hover:text-foreground"
      >
        <Share2 size={11} /> Share
      </button>
      {showAuthorActions && (
        <div className="mx-1 h-4 w-px bg-border/30" />
      )}
      {showAuthorActions && (
        <button
          onClick={() => onEdit(prompt)}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/40 px-2 py-1.5 text-[11px] font-medium text-foreground/80 transition-all hover:bg-secondary/50 hover:text-foreground"
        >
          <Pencil size={11} /> Edit
        </button>
      )}
      {showAuthorActions && (
        <button
          onClick={() => onMove(prompt)}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/40 px-2 py-1.5 text-[11px] font-medium text-foreground/80 transition-all hover:bg-secondary/50 hover:text-foreground"
        >
          <MoveRight size={11} /> Move
        </button>
      )}
      {!showAuthorActions && (
        <div className="mx-1 h-4 w-px bg-border/30" />
      )}
      <button
        onClick={onRequestDelete}
        className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/40 px-2 py-1.5 text-[11px] font-medium text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 size={11} /> Delete
      </button>
    </div>
  )
}
