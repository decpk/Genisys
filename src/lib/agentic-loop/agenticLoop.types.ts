import type { AIToolActivity, AIConfirmAction } from '@/right-panels/AIAssistantPanel'
import type { ToolModule } from '@/ai/tools/tools.types'

import type { CompletionTransport } from './transport/transport.types'

// ── Wire-level message shapes ────────────────────────────────────────

/** A tool call as carried inside an `assistant` message's `tool_calls` array. */
export interface AssistantToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

/** A tool call as returned by the completion transport's `result.toolCalls`. */
export interface RawToolCall {
  id: string
  name: string
  arguments: string
}

/**
 * Chat message shape sent to / received from the LLM. Loose enough to cover
 * system / user / assistant / tool turns, both with and without tool calls.
 *
 * `content` is `string | null` because the OpenAI multi-turn protocol
 * permits assistant messages with `null` content when only tool calls are
 * emitted.
 */
export type ChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: AssistantToolCall[] }
  | { role: 'tool'; tool_call_id: string; content: string }

// ── Completion result returned by the transport ──────────────────────

export interface CompletionResult {
  content: string
  toolCalls: RawToolCall[]
  finishReason: string
}

// ── Loop state ───────────────────────────────────────────────────────

export interface LoopState {
  /** 0-based iteration counter; bumped before each completion call. */
  iteration: number
  /** `name::args` → number of times this exact call has been made. */
  toolCallCounts: Map<string, number>
  /** Tool errors seen in a row without a successful tool result in between. */
  consecutiveErrors: number
  /** Total tool calls observed (including dedup-suppressed ones). */
  totalToolCalls: number
}

// ── Callbacks ────────────────────────────────────────────────────────

export interface AgenticLoopCallbacks {
  /** Streamed text token from the assistant turn. */
  onChunk: (token: string) => void
  /** Streamed reasoning/chain-of-thought token (if the model emits it). */
  onReasoningChunk?: (token: string) => void
  /** A tool is about to execute. */
  onToolStart: (activity: AIToolActivity) => void
  /** A tool finished executing — either with a result or an error. */
  onToolResult: (toolName: string, result: string) => void
  /** A confirm-required tool needs user approval. Resolve `true` to allow. */
  onConfirmRequired: (confirmAction: AIConfirmAction) => Promise<boolean>
  /** Optional auto-approval predicate — when truthy, skips `onConfirmRequired`. */
  isAutoApprove?: () => boolean
  /** The loop finished cleanly with the given final assistant content. */
  onDone: (content: string) => void
  /** The loop terminated with an error. */
  onError: (error: string) => void
  /**
   * Optional hook invoked when the iteration budget is exhausted. The host
   * may decide to stop the loop (return `false`) or grant more budget by
   * resetting state and returning `true`. When omitted, the loop forces a
   * final answer via `forceFinalAnswer`.
   */
  onContinueRequired?: (info: {
    iterationsUsed: number
    totalToolCalls: number
  }) => Promise<boolean>
}

// ── Tool registry ────────────────────────────────────────────────────

/** `toolName → ToolModule`. Same shape used by every panel runner today. */
export type ToolRegistry = Record<string, ToolModule>

// ── Options ──────────────────────────────────────────────────────────

export interface AgenticLoopOptions {
  /** Hard cap on completion iterations per loop. Defaults to MAX_AGENTIC_ITERATIONS. */
  maxIterations?: number
  /**
   * If the same `name + arguments` hash is seen more than this many times,
   * subsequent calls are suppressed with a dedup notice. Defaults to `2`.
   */
  repeatedToolCallLimit?: number
  /**
   * Stop the loop after this many consecutive tool errors with no successful
   * tool result in between. Defaults to `3`.
   */
  consecutiveErrorLimit?: number
  /** Optional predicate the loop polls; when it returns true, the loop stops. */
  isCancelled?: () => boolean
  /**
   * Optional per-tool-call permission gate. Invoked with the tool name
   * before the registry is consulted. Returning `false` short-circuits
   * execution with a tool-blocked-by-mode message fed back to the model.
   * Used to enforce read-only modes (Plan / Ask) at the dispatcher even
   * when a write tool slipped through the definitions filter or was
   * hallucinated by the model.
   */
  isToolAllowed?: (toolName: string) => boolean
  /**
   * Optional message builder paired with `isToolAllowed`. Receives the
   * blocked tool name and returns the string fed back to the model.
   * Defaults to a generic "tool not allowed" string.
   */
  buildBlockedToolMessage?: (toolName: string) => string
}

// ── Top-level params ─────────────────────────────────────────────────

export interface AgenticLoopParams {
  /** Transport that owns the wire calls to the streaming completion endpoint. */
  transport: CompletionTransport
  /** System prompt, prepended as the first message. */
  systemPrompt: string
  /** Conversation history; each entry must already be a valid `ChatMessage`. */
  conversationHistory: ChatMessage[]
  /** The latest user message. */
  userMessage: string
  /** Tool definitions sent to the model. Pass `[]` if the loop should not use tools. */
  tools: Array<ToolModule['definition']>
  /** Lookup map used to dispatch tool calls to local executors. */
  toolRegistry: ToolRegistry
  /** Streaming + lifecycle callbacks. */
  callbacks: AgenticLoopCallbacks
  /** Optional knobs. */
  options?: AgenticLoopOptions
}

// ── Re-exports for the public barrel ─────────────────────────────────

export type { CompletionTransport } from './transport/transport.types'
