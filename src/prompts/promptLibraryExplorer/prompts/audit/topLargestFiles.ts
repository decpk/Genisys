import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { auditAndInventory } from '../../categories/auditAndInventory'

export const topLargestFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0402-top-largest-files',
  categoryId: auditAndInventory.id,
  title: 'Top 20 largest files in the tree',
  description: 'Surface the biggest individual files across the entire repository.',
  sortOrder: 20,
  content: `List the 20 largest files anywhere in this directory tree.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, \`target\`, \`dist\`, \`.next\`, etc.) are auto-skipped by the tool.

1. \`find_files pattern="**/*" max_depth=6\`. If you get exactly 100 results, also run targeted passes for likely-large extensions (\`*.mp4\`, \`*.mov\`, \`*.zip\`, \`*.tar.gz\`, \`*.pdf\`, \`*.psd\`, \`*.iso\`, \`*.bin\`) and merge to widen coverage.
2. \`get_file_info\` each entry. **Skip folders** (their \`size\` is reported as 0).
3. Sort files by size desc and take the top 20.
4. Present a table: \`Rank | Path | Size | Extension | Modified\`.
5. Add a one-paragraph summary noting any extension that dominates (e.g. "12 of 20 are \`.mov\` videos in \`media/\`").`,
})
