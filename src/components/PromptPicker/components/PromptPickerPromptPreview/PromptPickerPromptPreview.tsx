import { Check, Copy } from 'lucide-react'

import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

import { promptPickerPromptPreviewStyles as styles } from './PromptPickerPromptPreview.styles'
import { usePromptPickerPromptPreviewData } from './usePromptPickerPromptPreviewData'
import type { PromptPickerPromptPreviewProps } from './PromptPickerPromptPreview.types'

/**
 * Body of the hover preview shown when the user hovers a row in
 * `PromptPicker`. Rendered inside a Radix `HoverCardContent` by the row.
 *
 * The user can move the cursor into this component to read or select text —
 * `PromptPicker.tsx` guards its own popover so interacting here does not
 * close the picker.
 */
export function PromptPickerPromptPreview(
  props: PromptPickerPromptPreviewProps,
): React.JSX.Element {
  const { prompt } = props
  const { justCopied, handleCopy } = usePromptPickerPromptPreviewData(prompt)

  const hasDescription = prompt.description.length > 0
  const copyIcon = justCopied ? <Check size={11} /> : <Copy size={11} />
  const copyLabel = justCopied ? 'Copied' : 'Copy prompt'

  let descriptionNode: React.ReactNode = null
  if (hasDescription) {
    descriptionNode = <div className={styles.description}>{prompt.description}</div>
  }

  // No outer wrapper: the `HoverCardContent` is already the flex column
  // owning the `max-h-[60vh]` constraint (see `PromptPickerPromptRow`).
  // Adding an intermediate `h-full` wrapper here breaks the height chain so
  // `styles.body`'s `flex-1 min-h-0 overflow-y-auto` never gets a definite
  // height and stops scrolling — keep header/description/body as direct
  // flex children of the popover.
  return (
    <>
      <div className={styles.header}>
        <span className={styles.title}>{prompt.title}</span>
        <button
          type="button"
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label={copyLabel}
          title={copyLabel}
        >
          {copyIcon}
        </button>
      </div>
      {descriptionNode}
      <div className={styles.body}>
        <MarkdownRenderer content={prompt.content} variant="compact" />
      </div>
    </>
  )
}
