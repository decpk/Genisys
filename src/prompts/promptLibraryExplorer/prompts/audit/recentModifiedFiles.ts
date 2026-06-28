import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { auditAndInventory } from '../../categories/auditAndInventory'

export const recentModifiedFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0405-recent-modified-files',
  categoryId: auditAndInventory.id,
  title: 'Files modified in the last 7 days',
  description: 'List recently-touched files across the tree, newest first.',
  sortOrder: 50,
  content: `List every file in this directory tree modified in the last 7 days.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, build outputs) are auto-skipped by the tool.

1. \`find_files pattern="**/*" max_depth=5\`. If you hit exactly 100 results, also run per-extension passes for the file types of interest (e.g. \`*.ts\`, \`*.tsx\`, \`*.md\`) and merge.
2. \`get_file_info\` on each entry to read its \`type\` and \`modified\` ISO timestamp. **Discard folders** (folder modified dates change whenever any descendant changes — misleading for "recently touched").
3. Keep only files modified within the last 7 days (compare \`modified\` to \`now - 7 days\`).
4. Sort newest first and present as a table: \`Path | Modified (relative, e.g. "2 hours ago") | Size | Extension\`.
5. Cap output to the 50 most recent and report the total matching count and the breakdown by day (e.g. "23 today, 12 yesterday, …").`,
})
