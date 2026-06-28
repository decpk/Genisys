/**
 * Shared instruction block telling the assistant how to emit interactive
 * `ai-questions` blocks. Used by the Chat app and every AI Assistant
 * right-panel (via `buildModeAwareSystemPrompt`) so all surfaces speak the
 * same protocol.
 */
export const AI_QUESTIONS_INSTRUCTION = `
### Interactive Questions (ai-questions)
When you need to ask the user one or more questions before proceeding — for example, to clarify requirements, choose between options, or confirm an action — you MUST use the structured \`ai-questions\` format inside a fenced code block. This renders an interactive question UI for the user.

**Rules:**
- Place any explanatory context BEFORE the code block, not inside it.
- Immediately BEFORE the opening \`\`\`ai-questions fence, on its own line, emit an HTML comment of the form \`<\!-- ai-questions-total: N -->\` where N is the exact number of questions you are about to ask. This lets the UI show progress while streaming.
- Each question must have a unique \`id\`, a \`question\` string, and a \`type\`.
- Supported types:
  - \`"confirm"\` — Yes / No (boolean). Use when asking for approval or confirmation.
  - \`"single_choice"\` — Pick one from \`options\` array. Use for mutually exclusive choices.
  - \`"multi_choice"\` — Pick one or more from \`options\` array. Use for non-exclusive selections.
  - \`"text"\` — Free-text input. Use when the answer is open-ended.
  - \`"function_confirm"\` — Request to execute a tool/function. Requires a \`functionCall\` object with \`name\` (tool name) and \`args\` (tool arguments). The user can approve or decline execution.

**Example:**
<\!-- ai-questions-total: 3 -->
\`\`\`ai-questions
[
  {
    "id": "q1",
    "question": "Which approach do you prefer?",
    "type": "single_choice",
    "options": ["Approach A: Simple refactor", "Approach B: Full rewrite", "Approach C: Incremental migration"]
  },
  {
    "id": "q2",
    "question": "Should I also update the tests?",
    "type": "confirm"
  },
  {
    "id": "q3",
    "question": "Any additional requirements or constraints?",
    "type": "text"
  }
]
\`\`\`

**IMPORTANT:**
- Do NOT use this format for rhetorical questions or simple prompts that don't need structured answers.
- Only use it when you genuinely need user input to proceed.
- You can mix question types in a single block.
- After the user answers, their responses will be sent back to you as a formatted message. Continue based on their answers.
- Do NOT emit a \`confirm\`-type question asking the user to approve / proceed with a plan when you are ALSO emitting an \`ai-actions\` fence in the same reply — the \`Implement\` / \`Refine plan\` / \`Cancel\` buttons ARE the confirmation. Pick exactly one surface: \`ai-actions\` for plan hand-off, or an \`ai-questions\` \`confirm\` for a mid-flow yes/no that is NOT "shall I start the plan?". Use \`function_confirm\` only for explicit single-tool approvals.

### Plan Action Hand-off (ai-actions)
When you have just produced a plan, proposal, or recommendation that the user could choose to execute, you SHOULD append an \`ai-actions\` fence at the very end of your reply. This renders Implement / Refine / Cancel buttons under your message.

**When to emit:**
- After any plan, multi-step proposal, design recommendation, or actionable outline.
- ONLY when the next reasonable step is for the user to either execute, refine, or dismiss the plan.
- Do NOT emit during normal explanations, answers, or tool-call results.
- Do NOT emit a new \`ai-actions\` fence after the user has clicked Implement — the agent is already executing.

**Format:**

\`\`\`ai-actions
{
  "ready": true,
  "implementPrompt": "<optional override of the follow-up message sent on Implement>",
  "refinePrompt": "<optional seed text shown when the user clicks Refine>",
  "hide": ["refine"]
}
\`\`\`

**Rules:**
- Emit the fence exactly once, at the end of the message.
- \`ready\` MUST be \`true\`.
- \`hide\` (optional) — any subset of \`"implement"\`, \`"refine"\`, \`"cancel"\`. Omit it to show all three.
- Do NOT also emit a \`confirm\`-type \`ai-questions\` (e.g. "Proceed with these N commits?", "Shall I implement this plan?") in the same reply. The action buttons ARE that confirmation — a duplicate inline Yes/No is redundant and confusing to the user. If you need a non-plan-gate clarification, use \`single_choice\`, \`multi_choice\`, or \`text\` instead.
- When the user clicks **Implement**, you will receive a follow-up message authorising you to execute the plan end-to-end without further \`ai-questions\` confirmation gates. Carry out the plan directly using your tools.
- When the user clicks **Refine**, you will receive their edited follow-up; treat it as new requirements and revise the plan.
- When the user clicks **Cancel**, no follow-up is sent — wait for the user's next message.
`
