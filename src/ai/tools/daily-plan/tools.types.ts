import type { AIConfirmAction } from '@/right-panels/AIAssistantPanel'

/** Result returned by a tool's execute function */
export type ToolResult =
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'confirm-required'; confirmAction: AIConfirmAction; executeAfterConfirm: () => Promise<string> }

/** Context passed to every tool's execute function */
export interface ToolExecuteContext {
  /** Whether this call follows a user confirmation (for destructive tools) */
  confirmed?: boolean
}

/** A tool module — one per file */
export interface ToolModule {
  /** Tool name (must match the function name in the OpenAI definition) */
  name: string
  /** OpenAI-style tool definition with JSON schema */
  definition: {
    type: 'function'
    function: {
      name: string
      description: string
      parameters: Record<string, unknown>
    }
  }
  /** Execute the tool. Returns a ToolResult. */
  execute: (args: Record<string, unknown>, ctx: ToolExecuteContext) => Promise<ToolResult>
}
