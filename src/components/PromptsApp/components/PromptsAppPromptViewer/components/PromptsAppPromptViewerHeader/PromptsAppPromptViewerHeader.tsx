import { Lock } from 'lucide-react'

import type { PromptsAppPromptViewerHeaderProps } from './PromptsAppPromptViewerHeader.types'

/**
 * Title row of the in-tab prompt viewer. Kept small and free of action
 * buttons — the action row is its own sibling component.
 */
export function PromptsAppPromptViewerHeader(
  props: PromptsAppPromptViewerHeaderProps,
): React.JSX.Element {
  const { prompt } = props

  return (
    <div className="flex items-center gap-2">
      <h1 className="truncate text-[15px] font-semibold tracking-tight">
        {prompt.title || 'Untitled prompt'}
      </h1>
      {prompt.isBuiltIn && (
        <Lock size={12} className="shrink-0 text-muted-foreground/50" />
      )}
    </div>
  )
}
