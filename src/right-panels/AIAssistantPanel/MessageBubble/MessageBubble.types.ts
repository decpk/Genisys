import type { AIMessage } from '../AIAssistantPanel.types'
import type {
  AIActionHandler,
  AIActionId,
  AIQuestion,
  AIQuestionAnswer,
} from '@/components/Chat/components/AIQuestionBlock'

export interface MessageBubbleProps {
  message: AIMessage
  showSeparator?: boolean
  /**
   * Optional callback fired when the user submits an `ai-questions` wizard
   * inside an assistant message. Surfaces typically forward the formatted
   * Q&A back to the assistant via `sendMessage`.
   */
  onSubmitAnswers?: (
    answers: AIQuestionAnswer[],
    questions: AIQuestion[],
  ) => void
  /**
   * Optional callback fired when the user clicks one of the action
   * buttons rendered from an `ai-actions` directive. Surfaces forward
   * this through `onActionClick` to their send/agent-mode plumbing.
   */
  onAction?: AIActionHandler
  /** True once the user has activated one of this message's action buttons. */
  isActionResolved?: boolean
  /** Which action was resolved (drives the highlighted-disabled state). */
  resolvedActionId?: AIActionId | null
  /**
   * Optional handler that inserts a fenced visual block (```mermaid /
   * ```chart) into the host app's active editor. When provided and the
   * message contains visual blocks, an "Insert into note" affordance is
   * rendered per block. Omitted by surfaces without an editor.
   */
  onInsertToEditor?: (markdown: string) => void
}

/** A fenced visual block extracted from an assistant message. */
export interface VisualBlock {
  kind: 'mermaid' | 'chart'
  /** The full fenced markdown including the ``` fences. */
  markdown: string
}
