import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { gitInsights } from '../../categories/gitInsights'

export const summarizeGitStatus = buildExplorerPrompt({
  id: 'p-exp-builtin-0701-summarize-git-status',
  categoryId: gitInsights.id,
  title: 'Summarize git status in plain English',
  description: 'Run git status and translate it into a human-friendly summary.',
  sortOrder: 10,
  content: `Translate the current \`git status\` into a plain-English summary.

**Tool note:** \`git_status\` returns the current branch, ahead/behind counts vs upstream, and a classified list of staged / unstaged / untracked files. \`git_branches\` returns local (and optionally remote) branches.

1. Call \`git_status\`. If it errors with "not a git repo", report that and stop.
2. Call \`git_branches\` for context on what branches exist locally.
3. If \`git_status\` reports zero changes and a clean working tree, output: "Working tree clean on \`<branch>\`." and stop.
4. Otherwise produce three short sections:
   - **Branch state** — current branch, ahead/behind counts vs upstream (call out detached HEAD if applicable).
   - **What's in progress** — counts of staged, unstaged, and untracked files. Group by directory or file type if there are >5 in any bucket.
   - **Suggested next step** — one of: \`commit staged changes\`, \`stage and commit\`, \`push\` (if ahead), \`pull --rebase\` (if behind), \`stash\` (if you want a clean tree quickly), or \`branch clean / discard\` (if changes look unintentional).
5. List the top 5 changed files as a table: \`Path | Change type (staged/unstaged/untracked) | Hint\` (hint = quick guess of what changed based on path).`,
})
