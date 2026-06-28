import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { gitInsights } from '../../categories/gitInsights'

export const mostChangedFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0702-most-changed-files',
  categoryId: gitInsights.id,
  title: 'Most-changed files in the last N commits',
  description: "Surface code 'hot spots' by counting how often each file was modified.",
  sortOrder: 20,
  content: `Find the hot spots in this repo's recent history.

**Tool note:** \`git_log\` defaults to 20 commits if no \`max_count\` is passed. \`git_show_commit\` returns a patch and truncates output to **200 lines** by default — the changed-file list lives at the top of the patch (\`diff --git …\` headers), so 200 lines is plenty for extracting filenames but won't show full diffs. Tool results overall truncate at 8000 chars per call.

1. Call \`git_log max_count=30\` (or \`{{50}}\` if the user asks for more).
2. For each commit hash returned, call \`git_show_commit commit=<hash> max_lines=200\` and extract changed file paths from the \`diff --git a/<path> b/<path>\` headers. You don't need the patch body — only the file list.
3. Aggregate counts per file and per immediate parent directory.
4. Present two tables:
   - **Top 15 individual files** — \`Path | Touch count | Last touched (commit subject)\`
   - **Top 10 directories** — \`Directory | Touch count\`
5. Add a one-paragraph interpretation: which areas of the codebase are churning most and why (infer from commit subjects and directory names).
6. Note any single file touched in >25% of recent commits — that's a strong refactor signal.`,
})
