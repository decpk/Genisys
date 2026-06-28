import type { ChatMessage } from '../../../../../../preload/index.d'
import type { ToolCall, CrawlNavLinks } from '../../hooks/useChatStream'
import type { AIActionHandler, AIActionId } from '../AIActionBlock'

export interface ChatMessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
  widthStyle?: React.CSSProperties
  modelId?: string
  toolCalls?: ToolCall[]
  preToolContent?: string
  onResend?: (content: string) => void
  crawlNavLinks?: CrawlNavLinks | null
  onCrawlNavigate?: (url: string) => void
  answeredMessageIds?: Set<string>
  onExecuteFunction?: (functionName: string, args: Record<string, unknown>) => Promise<string>
  /**
   * Invoked when the user clicks one of the action buttons rendered from
   * an `ai-actions` fence. Wired to the surface's send/agent-mode plumbing.
   */
  onAction?: AIActionHandler
  /** Set of message ids whose action row has already been resolved. */
  resolvedActionMessageIds?: Set<string>
  /** Map of message id → which action was chosen (for highlight + state). */
  resolvedActionByMessageId?: Map<string, AIActionId>
}
