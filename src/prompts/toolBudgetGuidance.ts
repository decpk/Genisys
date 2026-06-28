/**
 * Shared "Tool Budget" guidance appended to every panel-AI system prompt.
 *
 * Mirrors a common AI-chat permission-to-not-use-tools approach:
 *  - Allows the model to answer off-domain / meta questions directly.
 *  - Caps tool calls at MAX_AGENTIC_ITERATIONS per turn.
 *  - Forbids repeating identical tool calls.
 *  - Tells the model to bail out after a small number of useful calls.
 *
 * Each panel must replace its old "always use tools, never guess" rule
 * with these guidelines so off-domain prompts no longer loop until the
 * iteration cap is hit.
 *
 * Domain-specific text (e.g. "your domain is the daily planner") should
 * be passed by the caller via `domain` so this stays generic.
 */
export const MAX_AGENTIC_ITERATIONS = 25

export function buildToolBudgetGuidance(domain: string): string {
  return [
    '## Tool Usage Rules (READ CAREFULLY)',
    '',
    `1. **Tools are optional.** Use a tool only when you need current data about ${domain}. For general knowledge, opinions, meta questions about the app itself, or anything outside ${domain}, answer directly in plain text without calling any tool.`,
    `2. **Hard budget of ${MAX_AGENTIC_ITERATIONS} tool calls per turn.** Be efficient. After 1–3 successful tool calls you usually have enough context — answer the user.`,
    '3. **Never call the same tool with the same arguments twice.** Re-read the previous tool result instead. Repeated calls will be auto-blocked.',
    '4. **Do not retry empty results.** If a tool returns an empty/null result, pick a different tool or answer with what you already have. Do not call the same tool again hoping for different output.',
    '5. **Trust your own answer.** Once you have written a complete reply, stop calling tools.',
  ].join('\n')
}
