import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { gitInsights } from '../../categories/gitInsights'

export const localUncommittedChanges = buildExplorerPrompt({
  id: 'p-exp-builtin-0703-local-uncommitted-changes',
  categoryId: gitInsights.id,
  title: "Files I have local changes for but haven't committed",
  description: 'Group uncommitted changes by intent and call out anything risky to lose.',
  sortOrder: 30,
  content: `Audit my uncommitted work.

1. Call \`git_status\` to enumerate staged, unstaged, and untracked files.
2. For unstaged changes, call \`git_diff\` (no path) and summarize per file: lines added / removed.
3. Categorize each file:
   - Code change (likely intentional WIP)
   - Config/dependency change (note any lockfile drift)
   - Generated / build output (should probably be ignored)
   - Untracked new file (call out anything that looks important)
4. Present \`Path | Status | +/- | Category | Recommendation\`.
5. Flag anything large or risky to lose (>200 lines diff, new test files, migrations).`,
})
