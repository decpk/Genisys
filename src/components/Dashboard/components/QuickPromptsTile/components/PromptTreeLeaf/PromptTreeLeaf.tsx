import { memo, useState } from 'react'
import { Copy, FileText, Lock, Pin } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('prompts')

import { Tooltip } from '@/components/Tooltip'
import type { PmPrompt } from '@/store/prompt-manager-store'

interface PromptTreeLeafProps {
  prompt: PmPrompt
  /** Indent depth in pixels (multiplied per nesting level upstream). */
  indentPx: number
  onLaunch: (prompt: PmPrompt) => void
}

const PREVIEW_MAX_CHARS = 600

function buildPreview(content: string): string {
  if (content.length <= PREVIEW_MAX_CHARS) return content
  return `${content.slice(0, PREVIEW_MAX_CHARS)}…`
}

export const PromptTreeLeaf = memo(function PromptTreeLeaf(
  props: PromptTreeLeafProps
): React.JSX.Element {
  const { prompt, indentPx, onLaunch } = props
  const [copied, setCopied] = useState(false)

  const handleClick = (): void => onLaunch(prompt)

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      toast.success('Prompt copied to clipboard', { duration: 1500 })
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy prompt', { duration: 2000 })
    }
  }

  const preview = buildPreview(prompt.content)

  const popoverContent = (
    <div className="w-80 max-w-[min(20rem,calc(100vw-2rem))] space-y-1.5 whitespace-normal">
      <div className="flex items-center gap-1.5 min-w-0">
        {prompt.isPinned && (
          <Pin size={11} className="text-amber-500 shrink-0" fill="currentColor" />
        )}
        <span className="text-[12px] font-semibold text-foreground truncate min-w-0 flex-1">
          {prompt.title}
        </span>
        <Tooltip content="Copy prompt" side="top">
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 inline-flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
          >
            <Copy size={12} />
          </button>
        </Tooltip>
      </div>
      {prompt.description && (
        <p className="text-[11px] text-muted-foreground break-words">
          {prompt.description}
        </p>
      )}
      <pre className="text-[11px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words font-sans max-h-64 overflow-y-auto pr-1">
        {preview}
      </pre>
      <div className="text-[10px] text-muted-foreground/70 pt-1 border-t border-border/40">
        Click row to launch in Chat · Copy icon to copy
      </div>
    </div>
  )

  return (
    <Tooltip
      content={popoverContent}
      side="right"
      variant="popover"
      delayMs={350}
      interactive
      className="!whitespace-normal !block !p-3"
    >
      <button
        type="button"
        onClick={handleClick}
        style={{ paddingLeft: indentPx }}
        className="group/leaf w-full flex items-center gap-1.5 pr-2 py-1 rounded text-left hover:bg-secondary/40 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        <FileText size={12} className="text-violet-500/70 shrink-0" />
        <span className="text-[12px] text-foreground truncate flex-1 min-w-0">
          {prompt.title}
        </span>
        {prompt.isPinned && (
          <Pin size={10} className="text-amber-500 shrink-0" fill="currentColor" />
        )}
        {prompt.isBuiltIn && (
          <Lock size={9} className="text-muted-foreground/60 shrink-0" />
        )}
        <span
          onClick={(e) => {
            e.stopPropagation()
            void handleCopy(e as unknown as React.MouseEvent<HTMLButtonElement>)
          }}
          className="shrink-0 opacity-0 group-hover/leaf:opacity-100 transition-opacity"
          aria-hidden
        >
          <Copy size={11} className={copied ? 'text-emerald-500' : 'text-muted-foreground'} />
        </span>
      </button>
    </Tooltip>
  )
})
