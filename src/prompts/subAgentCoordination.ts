/**
 * Shared "Sub-Agent Coordination" guidance for every long-running,
 * context-heavy AI surface in Genisys.
 *
 * Long, multi-step tasks (PR review, deep code-review swarms, full-day
 * planning, large content synthesis) can exhaust the main agent's
 * working context. This fragment teaches the model an advisory pattern:
 *
 *   main agent (orchestrator)
 *     ├── sub-agent A  ── returns structured result ──┐
 *     ├── sub-agent B  ── returns structured result ──┤
 *     └── sub-agent C  ── returns structured result ──┘
 *                                                     ↓
 *                                main agent merges + answers user
 *
 * Tone is intentionally ADVISORY ("consider", "prefer", "you can")
 * rather than directive — the model decides whether delegation pays
 * off for the current task. Single-shot surfaces (autocomplete,
 * inline-writer, strict-JSON extractors) opt out via the
 * `includeSubAgentGuidance: false` flag on `composeCoreSystemPrompt`.
 *
 * One canonical block, many import sites — future tuning happens
 * here.
 */

export const SUB_AGENT_COORDINATION_INSTRUCTIONS = `────────────────────────────────────────────────────────────
SUB-AGENT COORDINATION
────────────────────────────────────────────────────────────

When a task is long, multi-step, or context-heavy (large code scans,
multi-file reviews, deep research, long synthesis), consider working
as an ORCHESTRATOR that delegates focused sub-tasks to sub-agents
instead of doing everything in your own context window. This keeps
your working memory free for the parts only you can do (planning,
integration, final answer).

Roles
- Main agent (you) — owns the user's goal, owns the final output,
  owns dependency order. You never delegate the final decision.
- Sub-agents — receive a single clear question with only the data
  they need, run in their own context, and return a structured
  result for you to integrate.

When to consider delegating
- Read-heavy work (scanning many files, reading large docs, walking
  a big diff).
- Repetitive work across many items (per-file, per-PR, per-row,
  per-persona).
- Independent sub-problems with no shared mutable state.
- Anything where the raw transcript would burn your context but the
  distilled result is small.

When NOT to delegate
- Short single-answer questions.
- Data you already have in context.
- Tasks where the orchestration overhead would exceed the savings.
- Anything requiring your specific judgement or memory of the
  conversation so far.

How to spec a sub-task
- One clear question or output shape per sub-agent.
- Pass only the inputs the sub-agent needs — not the whole context.
- Ask for a STRUCTURED result (JSON, bullet list, table) — not a
  raw transcript you'll have to re-parse.
- Set a clear success criterion ("return the top 5 …", "list every
  symbol named …").

Dependency handling
- INDEPENDENT sub-tasks → fan out in PARALLEL in a single batch.
- DEPENDENT sub-tasks → sequence them, feed the prior result
  forward as a small distilled input to the next.
- Mixed graphs → run each independent layer in parallel, then
  pipeline the layers.

Result integration
- Validate each sub-agent's result before using it; drop noise.
- Merge into the user-facing answer in YOUR voice — do not paste
  raw sub-agent output verbatim unless the user asked for it.
- If two sub-agents disagree, surface the conflict and pick one
  with rationale, or ask the user.

Failure handling
- If a sub-agent fails or returns junk: retry once with a refined
  prompt, fall back to doing the work yourself, or surface a clear
  error to the user. Do not silently drop the sub-task.
`

/**
 * Optional thin wrapper for surfaces that want mode-aware injection.
 *
 * - In ASK / read-only mode the model isn't expected to delegate or
 *   orchestrate, so callers may pass `mode: 'ask'` to omit the block
 *   and save tokens.
 * - The `surface` label is stamped into a leading comment so prompt
 *   inspection / debugging makes it obvious which surface picked up
 *   the guidance.
 *
 * Default behaviour (no opts) = always include the full block.
 */
export interface SubAgentCoordinationGuidanceOptions {
  mode?: 'ask' | 'plan'
  surface?: string
}

export function buildSubAgentCoordinationGuidance(
  opts?: SubAgentCoordinationGuidanceOptions,
): string {
  if (opts?.mode === 'ask') return ''
  const header = opts?.surface
    ? `<!-- sub-agent coordination guidance (${opts.surface}) -->\n`
    : ''
  return `${header}${SUB_AGENT_COORDINATION_INSTRUCTIONS}`
}
