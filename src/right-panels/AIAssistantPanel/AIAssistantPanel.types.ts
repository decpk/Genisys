import type { ComponentType } from 'react'

import type {
  AIActionHandler,
  AIActionId,
} from '@/components/Chat/components/AIQuestionBlock'

// ── Message ──────────────────────────────────────────────────

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Optional captured reasoning/chain-of-thought from the assistant turn. */
  reasoning?: string
  /** Optional snapshot of tool activities performed during the assistant turn. */
  activities?: AIToolActivity[]
}

// ── Tool Activity ────────────────────────────────────────────

export interface AIToolActivity {
  toolName: string
  /** Human-readable label. Falls back to toolName when not provided. */
  label?: string
  args?: Record<string, unknown>
  result?: string
  status: 'running' | 'done'
}

// ── Confirmation ─────────────────────────────────────────────

export interface AIConfirmActionItem {
  path: string
  type: string
  size?: string
  details?: string
}

export interface AIConfirmAction {
  action: string
  description: string
  items: AIConfirmActionItem[]
  warning: string
}

// ── Continue (tool-budget exhaustion) ────────────────────────

export interface AIContinueRequest {
  iterationsUsed: number
  totalToolCalls: number
}

// ── Session ──────────────────────────────────────────────────

export type AIStatus =
  | 'idle'
  | 'thinking'
  | 'awaiting-confirmation'
  | 'executing'
  | 'done'
  | 'error'

export interface AISession {
  id: string
  title: string
  updatedAt: string
  status: AIStatus
}

// ── Context Properties ──────────────────────────────────────

export interface AIContextItem {
  id: string
  label: string
  sublabel?: string
  icon?: ComponentType<{ size?: number; className?: string }>
  onClick?: () => void
  onRemove?: () => void
}

// ── Mode Selector ────────────────────────────────────────────

export interface AIModeOption {
  id: string
  label: string
  description: string
  icon: ComponentType<{ size?: number; className?: string }>
}

// ── Context Scope (page / notebook / chapter / book / etc.) ──

export interface AIContextScope {
  id: string
  label: string
  icon?: ComponentType<{ size?: number; className?: string }>
  description?: string
  disabled?: boolean
}

// ── Empty State ──────────────────────────────────────────────

export interface AIEmptyStateConfig {
  title?: string
  suggestions?: string[]
}

// ── Tool Info (for tools popover) ────────────────────────────

export interface AIToolInfo {
  name: string
  description: string
  category?: string
}

// ── Queued message (steer + queue composer) ──────────────────

export interface AIQueuedMessage {
  id: string
  text: string
}

// ── Mention (for AIEditor) ───────────────────────────────────

export interface AIMentionItem {
  id: string
  label: string
  description?: string
  icon?: ComponentType<{ size?: number; className?: string }>
  isGroup?: boolean
}

export interface AIMentionConfig {
  /** Trigger character. @default '@' */
  char?: string
  /** Label shown above the suggestion list (e.g. "Files", "Variables"). */
  menuLabel?: string
  /** Callback to fetch/filter mention items for a given query. */
  fetchItems: (query: string) => Promise<AIMentionItem[]>
}

// ── Panel Data ───────────────────────────────────────────────

export interface AIAssistantPanelData {
  messages: AIMessage[]
  status: AIStatus
  streamingContent: string
  toolActivities: AIToolActivity[]
  /** Live reasoning tokens accumulated during the current stream. Empty when no reasoning is in flight. */
  streamingReasoning?: string
  error: string | null
  pendingConfirm: AIConfirmAction | null
  pendingContinue?: AIContinueRequest | null
  sessions: AISession[]
  activeSessionId: string | null
  contextItems: AIContextItem[]
  contextLabel?: string
  emptyState?: AIEmptyStateConfig
  modes?: AIModeOption[]
  selectedMode?: string
  /**
   * Optional list of context scopes the user can switch between (e.g.
   * `Page` vs `Notebook` in Notes). When 2+ scopes are provided alongside
   * a `selectedContextScopeId` and `onContextScopeChange` action, the
   * panel renders an inline segmented pill in the composer's left slot.
   */
  contextScopes?: AIContextScope[]
  selectedContextScopeId?: string
  mentionConfig?: AIMentionConfig
  placeholder?: string
  toolsInfo?: AIToolInfo[]
  isLoadingHistory?: boolean
  isLoadingMessages?: boolean
  hasMoreMessages?: boolean
  /** Selected LLM model id. When provided alongside `onModelChange`, the panel renders an inline model picker. */
  selectedModelId?: string
  /**
   * AppView id this AI Assistant panel is mounted in (e.g. `'library'`,
   * `'notes'`). When provided, the panel renders an inline Prompt Picker
   * that surfaces user-defined prompt folders scoped to that app. Omit to
   * keep the previous behavior (no picker).
   */
  appId?: string
  /**
   * Set of assistant-message ids whose `ai-actions` row has been resolved
   * (one of the buttons clicked). The set is owned by the surface's
   * wrapper hook so it survives session switches.
   */
  resolvedActionMessageIds?: Set<string>
  /** Map of message id → which action was chosen (for highlight + state). */
  resolvedActionByMessageId?: Map<string, AIActionId>
  /**
   * Messages the user has queued (via ⌥/Alt+Enter) to run after the current
   * turn finishes. Rendered as removable chips above the composer. Only
   * surfaces that opt into steering/queuing (by providing `actions.steerMessage`)
   * populate this; omit it elsewhere to keep the previous behavior.
   */
  queuedMessages?: AIQueuedMessage[]
}

// ── Panel Actions ────────────────────────────────────────────

export interface AIAssistantPanelActions {
  [key: string]: (...args: never[]) => void
  sendMessage: (text: string, mentions?: string[]) => void
  /**
   * Optional handler for steering: inject a message into the turn that is
   * currently running (instead of starting a new one). When provided, the
   * panel keeps the composer editable while busy and routes a plain Enter to
   * this handler. Surfaces that omit it keep the previous "blocked while busy"
   * behavior.
   */
  steerMessage?: (text: string, mentions?: string[]) => void
  /**
   * Optional handler that queues a message to run after the current turn
   * finishes (⌥/Alt+Enter). Required alongside `steerMessage` for the queue
   * affordance to appear.
   */
  enqueueMessage?: (text: string, mentions?: string[]) => void
  /** Remove a previously queued message by id (chip ✕). */
  removeQueuedMessage?: (id: string) => void
  confirmAction: () => void
  cancelAction: () => void
  continueLoop?: () => void
  stopLoop?: () => void
  /**
   * Optional handler invoked when the user clicks the stop button or
   * presses Esc while the assistant is streaming. Implementations should
   * cancel the in-flight agentic loop (e.g. by bumping a request token).
   */
  onStop?: () => void
  resetSession: () => void
  createSession: () => void
  selectSession: (sessionId: string) => void
  removeSession: (sessionId: string) => void
  clearAllSessions: (preserveSessionId?: string) => void
  onModeChange: (modeId: string) => void
  /**
   * Optional handler invoked when the user switches the active context
   * scope (e.g. `Page` → `Notebook`). Required when `data.contextScopes`
   * has 2+ entries; otherwise the segmented pill is hidden.
   */
  onContextScopeChange?: (scopeId: string) => void
  loadMoreMessages: () => void
  /** Optional model change handler. When provided alongside data.selectedModelId, the panel renders an inline model picker. */
  onModelChange?: (modelId: string) => void
  /**
   * Optional handler for the `ai-actions` row. Receives the message id,
   * the chosen action, and any opts (typically `{ prompt }` for
   * implement/refine). When omitted, action buttons are hidden even if
   * the AI emits an `ai-actions` fence.
   */
  onActionClick?: (
    messageId: string,
    actionId: AIActionId,
    opts: { prompt?: string },
  ) => void
  /**
   * Insert the given markdown (e.g. a fenced ```mermaid/```chart visual
   * block) into the host app's active editor, if supported. Optional —
   * surfaces without an editor (Library, APIClient) omit it and the
   * "Insert into note" affordance stays hidden.
   */
  onInsertToEditor?: (markdown: string) => void
}
