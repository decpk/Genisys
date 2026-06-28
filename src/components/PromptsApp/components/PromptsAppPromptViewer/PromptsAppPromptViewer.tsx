import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

import { PromptsAppPromptViewerActions } from './components/PromptsAppPromptViewerActions'
import { PromptsAppPromptViewerHeader } from './components/PromptsAppPromptViewerHeader'
import type { PromptsAppPromptViewerProps } from './PromptsAppPromptViewer.types'
import { usePromptsAppPromptViewerData } from './usePromptsAppPromptViewerData'

/**
 * The "viewer" body that fills the PromptsApp content area when a
 * prompt tab is active. Replaces the old `PmPromptViewerDialog` modal —
 * same affordances (Use/Copy/Share/Edit/Move/Delete + Markdown body)
 * but rendered inline so multiple prompts can stay open in tabs.
 */
export function PromptsAppPromptViewer(
  props: PromptsAppPromptViewerProps,
): React.JSX.Element {
  const { prompt } = props
  const viewer = usePromptsAppPromptViewerData(props)

  const hasDescription = prompt.description.trim().length > 0

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="shrink-0 border-b border-border/40 bg-background px-5 py-3">
        <PromptsAppPromptViewerHeader prompt={prompt} />
        <div className="mt-2.5">
          <PromptsAppPromptViewerActions
            prompt={prompt}
            onCopy={viewer.handleCopy}
            onShare={viewer.handleShare}
            onEdit={viewer.handleEdit}
            onMove={viewer.handleMove}
            onRequestDelete={viewer.handleRequestDelete}
          />
        </div>
      </div>

      {hasDescription && (
        <div className="shrink-0 border-b border-border/30 bg-muted/20 px-5 py-2.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">
            {prompt.description}
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[880px] px-6 py-5">
          <MarkdownRenderer content={prompt.content} />
        </div>
      </div>
    </div>
  )
}
