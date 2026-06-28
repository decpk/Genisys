import { AppLoader } from '@/components/AppLoader'

import type { ClipboardImageHoverTabPanelProps } from './ClipboardImageHoverTabPanel.types'

/**
 * Renders the body of a single tab inside the hover popover. Shows
 * `AppLoader` while the AI analysis is pending, the text body when
 * available (selectable + scrollable), or a soft empty-state message
 * when no content has been generated yet.
 */
export function ClipboardImageHoverTabPanel(
  props: ClipboardImageHoverTabPanelProps
): React.JSX.Element {
  const { text, status, emptyMessage, pendingMessage } = props
  const hasText = Boolean(text && text.trim().length > 0)

  if (status === 'pending' && !hasText) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <AppLoader fullScreen={false} size={20} text={pendingMessage} />
      </div>
    )
  }

  if (hasText) {
    return (
      <div className="w-full h-full overflow-auto px-4 py-3 rounded-lg bg-background/40">
        <p className="text-xs text-foreground/85 whitespace-pre-wrap leading-relaxed select-text">
          {text}
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full p-4">
      <p className="text-xs text-muted-foreground/70 italic">{emptyMessage}</p>
    </div>
  )
}
