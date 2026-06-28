import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { duplicatesAndCleanup } from '../../categories/duplicatesAndCleanup'

export const findIdenticalFilenames = buildExplorerPrompt({
  id: 'p-exp-builtin-0201-find-identical-filenames',
  categoryId: duplicatesAndCleanup.id,
  title: 'Find files with identical names across subfolders',
  description: 'Surface basename collisions that can cause confusion or accidental overwrites.',
  sortOrder: 10,
  content: `Find files in this directory tree that share the same basename across different folders.

**Tool note:** \`find_files\` returns both files and folders, and caps at **100 results per call**. For deep trees, increase \`max_depth\` cautiously or partition the search by extension.

1. Call \`find_files pattern="**/*" max_depth=5\` to enumerate the tree. If the result count is exactly 100, also run targeted calls per extension you care about (e.g. \`find_files pattern="*.tsx" max_depth=8\`) and merge — the 100-cap is per call.
2. Filter the merged list to **files only**. A quick proxy: keep entries whose basename contains a \`.\` (extension) and discard entries you recognize as known folders (e.g. \`src\`, \`dist\`). Skip definitive disambiguation via \`get_file_info\` unless basenames collide ambiguously.
3. Group by basename (the part after the last \`/\`).
4. Report any basename appearing in 2+ folders as a table:
   \`Basename | Locations (count) | First 3 paths | Sizes (from get_file_info if needed)\`.
5. Sort by collision count desc, then by basename.
6. Read-only — do not delete or rename anything. Suggest which collisions look intentional (\`index.ts\`, \`README.md\`) vs accidental.`,
})
