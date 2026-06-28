/**
 * Fixed catalog of action ids the action footer can render. The AI cannot
 * invent new ones — it can only opt into / out of this set via the
 * `ai-actions` fence (see {@link parseActions}).
 */
export type AIActionId = 'implement' | 'refine' | 'cancel'

/**
 * Optional overrides emitted by the assistant inside an `ai-actions` fence.
 *
 * - `ready` is mandatory truthy: it signals "the plan above is actionable".
 * - `implementPrompt` / `refinePrompt` let the AI give the user-facing
 *   follow-up message a contextual nudge ("Implement phase 1 only", …).
 *   When omitted, the surface uses the defaults from
 *   {@link DEFAULT_IMPLEMENT_PROMPT} / {@link DEFAULT_REFINE_PROMPT}.
 * - `hide` lets the AI suppress specific buttons (e.g. a Q&A reply that
 *   only wants "Implement" without a "Refine" option).
 */
export interface AIActionDirective {
  ready: true
  implementPrompt?: string
  refinePrompt?: string
  hide?: AIActionId[]
}

export interface AIActionOpts {
  /** Resolved follow-up prompt for `implement` / `refine`. Empty for `cancel`. */
  prompt?: string
}

export type AIActionHandler = (id: AIActionId, opts: AIActionOpts) => void

export interface AIActionBlockProps {
  directive: AIActionDirective
  /** True once the user has activated one of the buttons. Disables the row. */
  isResolved: boolean
  /** Which action was selected (controls the disabled-but-highlighted state). */
  resolvedAction?: AIActionId | null
  onAction: AIActionHandler
}
