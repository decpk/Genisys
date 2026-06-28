import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { auditAndInventory } from '../../categories/auditAndInventory'

export const fileCountByExtension = buildExplorerPrompt({
  id: 'p-exp-builtin-0403-file-count-by-extension',
  categoryId: auditAndInventory.id,
  title: 'File count grouped by extension',
  description: 'Count files per extension across the tree to understand its composition.',
  sortOrder: 30,
  content: `Produce an extension-by-extension inventory of this tree.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, build outputs) are auto-skipped by the tool.

1. \`find_files pattern="**/*" max_depth=5\`. If the result count is exactly 100, also run per-extension passes for extensions you can see in the partial result (e.g. \`find_files pattern="*.ts" max_depth=8\`) and merge — the 100-cap is per call.
2. From the merged paths, drop folders (proxy: entries whose basename has no \`.\`, or known directory names you recognized while scanning).
3. Group remaining files by their lowercased extension (files with no extension go under \`(none)\`).
4. For each group: report file count. For the size column, sample up to 10 files per group via \`get_file_info\`, sum them, and report \`avg × count\` as an **estimate** (mark with \`~\`). Group-total accurate sizing would require N \`get_file_info\` calls and is rarely worth the cost.
5. Present a table sorted by count desc: \`Extension | Count | Est. total size | Example paths\`.
6. End with a one-line summary: "Tree contains **N** files across **K** extensions; the top 3 by count are …".`,
})
