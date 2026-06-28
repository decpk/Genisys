import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { duplicatesAndCleanup } from '../../categories/duplicatesAndCleanup'

export const findStaleFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0206-find-stale-files',
  categoryId: duplicatesAndCleanup.id,
  title: 'Find files not modified in N months',
  description: 'Locate stale files untouched for the given window — useful for archive/cleanup decisions.',
  sortOrder: 60,
  content: `Find files in this tree not modified in the last \`{{6}}\` months.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, \`dist\`, \`build\`) are auto-skipped by the tool.

1. \`find_files pattern="**/*" max_depth=5\`. If you hit exactly 100 results, also do per-extension passes for the file types you care about (e.g. \`*.pdf\`, \`*.docx\`, \`*.png\`) and merge.
2. For each entry, call \`get_file_info\` to read its \`type\` and \`modified\` ISO timestamp. **Discard folders** (a folder's modified date changes whenever its children change, so it's not a useful staleness signal here).
3. Compute \`age = today - modified\` and filter to files older than the threshold.
4. Present the 30 oldest as a table: \`Path | Last modified | Age (months) | Size\`.
5. Group by age bucket: \`6-12 months\`, \`1-2 years\`, \`2+ years\`. Show counts per bucket.
6. Read-only — propose what to archive/delete; do not act without confirmation.`,
})
