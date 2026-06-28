import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { duplicatesAndCleanup } from '../../categories/duplicatesAndCleanup'

export const findLargeFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0205-find-large-files',
  categoryId: duplicatesAndCleanup.id,
  title: 'Find files larger than a threshold',
  description: 'Surface files larger than a size threshold (default 50 MB) for review.',
  sortOrder: 50,
  content: `List every file in this directory tree larger than \`{{50 MB}}\`.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, \`target\`, \`dist\`, \`.next\`, etc.) are auto-skipped by the tool.

1. \`find_files pattern="**/*" max_depth=6\`. If the result count hits 100, also run per-extension passes for likely-large types (\`*.mp4\`, \`*.mov\`, \`*.zip\`, \`*.psd\`, \`*.iso\`, \`*.bin\`, \`*.log\`) and merge.
2. For each entry, call \`get_file_info\` to read \`size\` and \`type\`. **Discard folders** (folders return size 0 here).
3. Convert sizes to human-readable units (KB/MB/GB) and filter to files ≥ the threshold.
4. Sort desc by size and present the top 30: \`Path | Size | Modified | Extension\`.
5. Also report cumulative size of the matched set and how it compares to the parent folder's total (\`get_disk_usage "."\`).
6. Read-only — flag candidates for review; do not delete anything.`,
})
