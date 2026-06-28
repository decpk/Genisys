export type ExplorerAIStatus =
  | 'idle'
  | 'thinking'
  | 'awaiting-confirmation'
  | 'executing'
  | 'done'
  | 'error'

export interface ExplorerAIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface ExplorerConfirmAction {
  action: string
  description: string
  items: { path: string; type: string; size?: string; details?: string }[]
  warning: string
}

/** A pending shell command awaiting the user's approval before it runs. */
export interface ExplorerShellConfirm {
  confirmId: string
  command: string
  cwd?: string
}

export interface ToolActivity {
  toolName: string
  /** Human-readable label. Falls back to toolName when not provided. */
  label?: string
  args?: Record<string, unknown>
  result?: string
  status: 'running' | 'done'
}
