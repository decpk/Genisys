/**
 * Per-step lifecycle.
 * Mirrors `ToolActivity['status']` so the underlying `StepProgressList`
 * can render plan steps with identical semantics.
 */
export type AIPlanStepStatus = 'pending' | 'running' | 'done' | 'error'

/**
 * A single user-facing step in the assistant's published plan.
 * Authored by the model inside an `ai-plan` fenced code block.
 */
export interface AIPlanStep {
  /** Stable id used by `<!-- ai-step: id=... -->` markers to update status. */
  id: string
  /** Short user-facing title — name the OUTCOME, not the tool calls. */
  title: string
  /** Live status — defaults to `pending` until a marker advances it. */
  status: AIPlanStepStatus
  /** Optional one-line subtext shown after the title. */
  detail?: string
}

/**
 * Result of running `parseAIPlan(content)` against an assistant message.
 * `hasPlan === false` ⇒ no `ai-plan` fence was emitted and `steps` is empty.
 */
export interface ParsedAIPlan {
  hasPlan: boolean
  steps: AIPlanStep[]
}

/** Props for the `AIPlanProgress` view component. */
export interface AIPlanProgressProps {
  steps: AIPlanStep[]
  className?: string
}
