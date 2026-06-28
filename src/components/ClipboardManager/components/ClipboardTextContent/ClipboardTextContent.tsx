import { memo } from 'react'
import { cn } from '@/lib/utils'
import { ClipboardCodeView } from '../ClipboardCodeView'
import { useClipboardTextContentData } from './useClipboardTextContentData'
import { PLAIN_TEXT_STYLES, MODAL_PLAIN_WRAPPER_STYLES } from './ClipboardTextContent.styles'
import type { ClipboardTextContentProps } from './ClipboardTextContent.types'

export const ClipboardTextContent = memo(function ClipboardTextContent(
  props: ClipboardTextContentProps,
): React.JSX.Element {
  const { text, displayText, mode } = props
  const { shouldHighlight, lang } = useClipboardTextContentData({ text, displayText })

  let content: React.JSX.Element
  if (shouldHighlight) {
    content = <ClipboardCodeView code={displayText} lang={lang} mode={mode} />
  } else if (mode === 'modal') {
    content = (
      <div className={MODAL_PLAIN_WRAPPER_STYLES}>
        <p className={cn(PLAIN_TEXT_STYLES.modal)}>{displayText}</p>
      </div>
    )
  } else {
    content = <p className={cn(PLAIN_TEXT_STYLES.card)}>{displayText}</p>
  }

  return content
})
