import type { LucideIcon } from 'lucide-react'

/** A single tool execution to display. */
export interface ToolActivity {
  /** Stable React key. */
  id: string
  /** Tool identifier (used to derive icon/label when none provided). */
  toolName: string
  /** Optional human-readable label override. */
  label?: string
  /**
   * Execution status.
   * - `pending` — declared but not yet started (e.g. plan-first flows). Renders as a muted, hollow indicator in `steps` mode.
   * - `running` — currently executing. Renders with an animated indicator.
   * - `done`    — finished successfully.
   * - `error`   — finished with failure.
   */
  status: 'pending' | 'running' | 'done' | 'error'
  /** Optional one-line argument summary shown after the label (expandable / steps modes). */
  argSummary?: string
  /** Optional full result text shown when expanded (expandable / steps modes). */
  result?: string
  /** Optional icon override. */
  icon?: LucideIcon
}

export type ToolActivityRendererMode = 'inline' | 'expandable' | 'steps'

export interface ToolActivityRendererProps {
  /** Activities to render — order is preserved. */
  activities: ToolActivity[]
  /**
   * Visual mode.
   * - `inline`     — minimal one-line-per-activity list.
   * - `expandable` — collapsible block with header + per-row details.
   * - `steps`      — VS Code-style numbered step timeline (header + connector lines + per-step indicator).
   *                  Default for both Chat and AI Assistant surfaces.
   */
  mode?: ToolActivityRendererMode
  /** Extra classes appended to the wrapper. */
  className?: string
}
