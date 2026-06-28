import { memo } from 'react'
import { cn } from '@/lib/utils'
import { useClipboardCodeViewData } from './hooks/useClipboardCodeViewData'
import {
  CONTAINER_STYLES,
  FALLBACK_PRE_STYLES,
  FALLBACK_CODE_STYLES,
} from './ClipboardCodeView.styles'
import type { ClipboardCodeViewProps } from './ClipboardCodeView.types'

export const ClipboardCodeView = memo(function ClipboardCodeView(
  props: ClipboardCodeViewProps,
): React.JSX.Element {
  const { code, lang, mode } = props
  const { html } = useClipboardCodeViewData({ code, lang })

  const hasHighlightedHtml = html.length > 0

  let content: React.JSX.Element
  if (hasHighlightedHtml) {
    content = (
      <div
        className={cn(CONTAINER_STYLES[mode])}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  } else {
    content = (
      <pre className={cn(FALLBACK_PRE_STYLES[mode])}>
        <code className={cn(FALLBACK_CODE_STYLES[mode])}>{code}</code>
      </pre>
    )
  }

  return content
})
