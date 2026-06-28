import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { gitInsights } from '../../categories/gitInsights'

export const commitsByAuthor = buildExplorerPrompt({
  id: 'p-exp-builtin-0705-commits-by-author',
  categoryId: gitInsights.id,
  title: 'Recent commits grouped by author',
  description: 'Group the last N commits by author with subject lines.',
  sortOrder: 50,
  content: `Group the last \`{{30}}\` commits by author.

1. Call \`git_log\` with \`max_count={{30}}\`.
2. Group commits by author name/email.
3. For each author, list:
   - Total commit count in this window
   - Date range (first / last commit)
   - Subject line of each commit (chronological)
4. Sort authors by commit count desc.
5. Add a one-paragraph summary of who's been most active and on which areas (inferred from commit subjects).`,
})
