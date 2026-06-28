import {
  LIBRARY_READ_TOOL_NAMES,
  LIBRARY_TOOL_DEFINITIONS,
  LIBRARY_TOOL_REGISTRY,
} from '@/ai/tools/library'
import type { AIToolActivity, AIConfirmAction } from '@/right-panels/AIAssistantPanel'
import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import {
  buildBlockedToolMessage,
  createIsToolAllowedForMode,
  filterToolDefinitionsByMode,
} from '@/lib/ai-tool-mode-gate'
import {
  agenticLoop,
  createDailyPlanTransport,
  USE_NEW_AGENTIC_LOOP,
} from '@/lib/agentic-loop'

export interface LibraryAIRunnerCallbacks {
  onChunk: (token: string) => void
  onReasoningChunk?: (token: string) => void
  onToolStart: (activity: AIToolActivity) => void
  onToolResult: (toolName: string, result: string) => void
  onConfirmRequired: (confirmAction: AIConfirmAction) => Promise<boolean>
  /**
   * Optional predicate that lets the host short-circuit confirmation
   * prompts (e.g. when the panel is running in `'agent'` mode). When it
   * returns `true`, the runner skips `onConfirmRequired` and executes
   * the tool's `executeAfterConfirm` directly.
   */
  isAutoApprove?: () => boolean
  /**
   * Optional hook invoked when the agentic loop has used its iteration
   * budget. Resolve `true` to grant another budget, `false` to stop.
   */
  onContinueRequired?: (info: {
    iterationsUsed: number
    totalToolCalls: number
  }) => Promise<boolean>
  onDone: (content: string) => void
  onError: (error: string) => void
}

/**
 * Drive the Library AI assistant through the shared frontend agentic
 * loop. This executes Library tools (books, chapters, inserting/appending/
 * replacing chapter content, rewriting chapters, bookmarks, navigation,
 * etc.) in-browser against the Zustand store — so the assistant can edit
 * the current book and its chapters just like a user can in the UI.
 *
 * The transport (`createDailyPlanTransport`) is a generic frontend
 * completion transport, despite the name — it is reused here.
 */
export async function runLibraryAI(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
  callbacks: LibraryAIRunnerCallbacks,
  options: { mode?: AgentMode; model?: string } = {},
): Promise<void> {
  const mode: AgentMode = options.mode ?? 'agent'
  const readNames = LIBRARY_READ_TOOL_NAMES
  const filteredTools = filterToolDefinitionsByMode(
    mode,
    LIBRARY_TOOL_DEFINITIONS,
    readNames,
  )
  const isToolAllowed = createIsToolAllowedForMode(mode, readNames)

  if (!USE_NEW_AGENTIC_LOOP) {
    callbacks.onError(
      'The Library AI assistant requires the frontend agentic loop to be enabled.',
    )
    return
  }

  return agenticLoop({
    systemPrompt,
    conversationHistory: conversationHistory as never,
    userMessage,
    tools: filteredTools,
    toolRegistry: LIBRARY_TOOL_REGISTRY,
    transport: createDailyPlanTransport({
      modelGetter: () => options.model,
    }),
    callbacks,
    options: {
      isToolAllowed,
      buildBlockedToolMessage: (name) => buildBlockedToolMessage(mode, name),
    },
  })
}
