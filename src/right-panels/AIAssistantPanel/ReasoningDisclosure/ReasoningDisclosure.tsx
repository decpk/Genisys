import { memo, useState } from 'react'
import { Brain, ChevronDown, ChevronRight } from 'lucide-react'

import { reasoningDisclosureStyles as styles } from './ReasoningDisclosure.styles'

interface ReasoningDisclosureProps {
  /** The reasoning/thinking text to display. */
  reasoning: string
  /** When true, the disclosure shows a subtle live indicator. */
  isStreaming?: boolean
  /** Initial open state. Defaults to closed for persisted, open for streaming. */
  defaultOpen?: boolean
}

/**
 * Collapsible "Thoughts" disclosure that surfaces the model's reasoning
 * channel (chain-of-thought / thinking tokens) above the assistant content.
 *
 * Renders as a compact toggle row so it stays unobtrusive when collapsed.
 */
export const ReasoningDisclosure = memo(function ReasoningDisclosure(
  props: ReasoningDisclosureProps,
): React.JSX.Element | null {
  const { reasoning, isStreaming = false, defaultOpen } = props
  const initialOpen = defaultOpen ?? isStreaming
  const [open, setOpen] = useState(initialOpen)

  if (!reasoning) return null

  return (
    <div className={styles.root}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={styles.toggle}
      >
        {open ? (
          <ChevronDown size={11} className={styles.chevron} />
        ) : (
          <ChevronRight size={11} className={styles.chevron} />
        )}
        <Brain size={11} className={styles.icon} />
        <span className={styles.label}>
          {isStreaming ? 'Thinking…' : 'Thoughts'}
        </span>
        {isStreaming && <span className={styles.pulse} />}
      </button>
      {open && (
        <div className={styles.body}>
          <div className={styles.bodyText}>{reasoning}</div>
        </div>
      )}
    </div>
  )
})
