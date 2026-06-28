import { NodeViewWrapper } from '@tiptap/react'

/**
 * React NodeView for the StylizedDivider Tiptap node.
 *
 * Renders the same gold gradient + diamond glyph the AI Assistant uses
 * between message turns (see `AbuDhabiSeparator` in
 * `src/right-panels/AIAssistantPanel/MessageBubble/MessageBubble.tsx`).
 * Classnames are duplicated locally so this NodeView stays decoupled from
 * the AI Assistant style module.
 */
const styles = {
  wrapper: 'my-10 flex items-center gap-2 px-4',
  line:
    'flex-1 h-px bg-gradient-to-r from-transparent via-primary/25 to-primary/8',
  lineReverse:
    'flex-1 h-px bg-gradient-to-l from-transparent via-primary/25 to-primary/8',
  icon: 'text-primary/35 shrink-0',
} as const

export function StylizedDividerNodeView(): React.JSX.Element {
  return (
    <NodeViewWrapper
      as="div"
      data-stylized-divider=""
      contentEditable={false}
      draggable={false}
    >
      <div className={styles.wrapper}>
        <div className={styles.line} />
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={styles.icon}
          aria-hidden="true"
        >
          <path
            d="M6 0 L8.5 3.5 L12 6 L8.5 8.5 L6 12 L3.5 8.5 L0 6 L3.5 3.5 Z"
            fill="currentColor"
          />
        </svg>
        <div className={styles.lineReverse} />
      </div>
    </NodeViewWrapper>
  )
}
