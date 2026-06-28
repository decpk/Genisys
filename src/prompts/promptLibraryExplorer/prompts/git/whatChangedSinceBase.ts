import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { gitInsights } from '../../categories/gitInsights'

export const whatChangedSinceBase = buildExplorerPrompt({
  id: 'p-exp-builtin-0704-what-changed-since-base',
  categoryId: gitInsights.id,
  title: 'Summarize what changed since base branch',
  description: "Diff against a base branch (default 'main') and produce a human summary.",
  sortOrder: 40,
  content: `Summarize what changed in this branch since \`{{main}}\`.

1. \`git_diff\` with \`base="{{main}}"\` to get the full diff.
2. Also run \`git_log\` filtered to commits not on \`{{main}}\` for context.
3. Group changes into sections (each as a short bullet with file paths):
   - **New features / files**
   - **Bug fixes / behavior changes**
   - **Refactors / renames**
   - **Tests added / changed**
   - **Config / dependency updates**
   - **Generated / noise (lockfiles, snapshots)**
4. Cap each section to 5 bullets. End with totals: \`N files changed, +X / -Y lines\`.`,
})
