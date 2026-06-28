/**
 * Instruction snippet to inject into any AI assistant system prompt that uses
 * tools emitting entity-link tokens (e.g. `[[entity:clipboard:<id>|Preview]]`).
 *
 * Models tend to "tidy up" tool output and silently strip these tokens. This
 * rule tells them not to.
 */
export const ENTITY_TOKEN_PROMPT_RULE = `## Entity Link Tokens (MANDATORY)

Tool results may contain tokens of the form \`[[entity:<type>:<id>|<label>]]\` (or \`[[entity:<type>:<id>]]\`). These are **clickable chips** in the UI that open the underlying item in a modal.

Rules — these are non-negotiable:
1. **Preserve tokens verbatim.** Copy them character-for-character from tool output into your reply.
2. **Never strip, rewrite, summarize, decode, or "clean up"** these tokens. Do not replace them with raw IDs, plain text, links, or markdown.
3. **Never invent tokens.** Only use tokens that appeared in tool output during this turn.
4. When you reformat tool output (e.g. into your own table or paragraph), the cell/sentence that originally contained the token must still contain the exact same token. Prefer keeping the same column the tool used (e.g. "Preview" / "Description" cell) so the chip stays the user-facing label.
5. If the user asks to open / view / inspect an item, render its entity token so they can click it — do not just paste the raw ID.`
