/**
 * System-prompt fragment teaching the model how to publish a step plan and
 * report progress markers. Appended to `buildSystemPrompt()` in `useChatStream`
 * so the same instruction is available to every chat surface (Chat + every AI
 * Assistant right-panel).
 *
 * Keep this in sync with `parseAIPlan` / `extractStepStatuses` — the regex
 * patterns there are the contract on the host side.
 */
export const AI_PLAN_INSTRUCTION = `
### Plan Progress (\`ai-plan\` fence) — multi-step work only

When you are about to perform work that breaks naturally into **3 or more discrete logical steps** (e.g. multi-commit work, multi-phase refactors, multi-file batch changes, long shell pipelines), you MUST publish a step plan up-front so the UI can render a live progress card. This card is what the user watches — the underlying tool calls are an implementation detail and are collapsed away.

**1. Publish the plan ONCE at the top of your response, before any tool call:**

\`\`\`ai-plan
[
  { "id": "1", "title": "Stage and commit clock files" },
  { "id": "2", "title": "Stage and commit chat-ui files" },
  { "id": "3", "title": "Stage and commit quit files" },
  { "id": "4", "title": "Push to origin/master" }
]
\`\`\`

Rules for the fence:
- The body MUST be a JSON array. Each entry MUST have a unique \`id\` (string) and a short user-facing \`title\` describing the **outcome** (e.g. "Commit 1 (clock)" — NOT "git stage_files + git commit").
- Optional \`detail\` (string) for a one-line subtext.
- Do NOT include an initial \`status\` — the UI defaults every step to \`pending\`.
- Emit the fence exactly once. Do not re-emit a revised plan mid-response.

**2. Report progress with plain HTML comments (they are stripped from the rendered prose):**

Right BEFORE you start a step:
\`<!-- ai-step: id="1" status="running" -->\`

Right AFTER you finish a step (\`done\` for success, \`error\` for failure):
\`<!-- ai-step: id="1" status="done" -->\`

Rules for markers:
- Emit the \`running\` marker on its own line just before you call the first tool for that step.
- Emit the \`done\` / \`error\` marker on its own line as soon as the step is complete.
- Later markers win — re-emitting an id with a new status updates the card.
- Markers are pure metadata. They render as nothing — feel free to also write a short prose line for the user.

**When NOT to emit a plan:**
- Single-tool answers, short Q&A, lookups, or "explain this code" turns. The progress card would just be visual noise.
- Pure conversation with no tool calls at all.
- When the work fits in 1–2 logical steps — let the tool-call timeline do its job.

**Worked example (3-commit + push run):**

\`\`\`ai-plan
[
  { "id": "1", "title": "Commit clock chip changes" },
  { "id": "2", "title": "Commit chat-ui step-progress changes" },
  { "id": "3", "title": "Commit quit-confirm modal" },
  { "id": "4", "title": "Push to origin/master" }
]
\`\`\`

<!-- ai-step: id="1" status="running" -->
(calls: git status → git stage_files → git commit)
<!-- ai-step: id="1" status="done" -->

<!-- ai-step: id="2" status="running" -->
(calls: git stage_files → git commit)
<!-- ai-step: id="2" status="done" -->

…and so on, ending with a brief summary.
`
