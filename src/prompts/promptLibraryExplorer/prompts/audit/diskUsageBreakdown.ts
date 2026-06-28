import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { auditAndInventory } from '../../categories/auditAndInventory'

export const diskUsageBreakdown = buildExplorerPrompt({
  id: 'p-exp-builtin-0401-disk-usage-breakdown',
  categoryId: auditAndInventory.id,
  title: 'Disk usage breakdown by immediate subfolder',
  description: 'Report which subfolders take up the most space, sorted desc.',
  sortOrder: 10,
  content: `Produce a disk-usage report for this folder, broken down by immediate subfolder.

1. \`list_directory "."\` to enumerate top-level folders.
2. For each subfolder, run \`get_disk_usage\` to get total bytes, file count, folder count.
3. Also call \`get_disk_usage\` on the root (\`.\`) for the grand total.
4. Present a table sorted by size desc: \`Subfolder | Size | % of total | File count | Folder count\`.
5. Highlight any single subfolder consuming >50% of total — that's a refactor / cleanup candidate.`,
})
