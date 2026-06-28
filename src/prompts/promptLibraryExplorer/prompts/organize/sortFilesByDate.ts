import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { organizeAndCategorize } from '../../categories/organizeAndCategorize'

export const sortFilesByDate = buildExplorerPrompt({
  id: 'p-exp-builtin-0102-sort-by-date',
  categoryId: organizeAndCategorize.id,
  title: 'Sort files into year/month subfolders by modified date',
  description: 'Organize a flat folder into YYYY/MM subfolders based on file modification dates.',
  sortOrder: 20,
  content: `Organize this folder into \`YYYY/MM/\` subfolders based on each file's modified date.

**Tool note:** \`get_file_info\` returns \`modified\` as an **ISO-8601 / RFC-3339 string** (e.g. \`2025-03-14T09:41:02+00:00\`). Parse the year and month from this directly. \`create_folder\` creates parent directories in one call. \`move_item\` fails if the destination path already exists.

1. \`list_directory "."\` then call \`get_file_info\` on each file to read its \`type\` and \`modified\` timestamp. Skip folders.
2. For each file, compute the target subfolder as \`YYYY/MM/\` (zero-padded month, e.g. \`2025/03/\`).
3. Skip files that already live in a path matching the \`YYYY/MM/\` shape.
4. Present the plan as a table grouped by month: \`YYYY-MM | File count | Total size | Example filenames\`. Add a totals row.
5. Ask for confirmation before any write.
6. After \`CONFIRMED\`:
   - For each distinct \`YYYY/MM/\` target, call \`create_folder folder_path="YYYY/MM"\` (parents are created automatically and re-runs are silent no-ops).
   - For each file, call \`move_item source=<file> destination="YYYY/MM/<basename>"\`. If the destination already exists, append \` (1)\`, \` (2)\`, … to the basename until \`move_item\` succeeds.
7. Report final outcome: \`N moved across M month folders, K skipped (already organized), C collisions resolved, E errors\`.

Optional: limit scope to a file pattern such as \`{{*.pdf or *.jpg}}\` to avoid touching unrelated files (replace step 1 with \`find_files\` for that pattern).`,
})
