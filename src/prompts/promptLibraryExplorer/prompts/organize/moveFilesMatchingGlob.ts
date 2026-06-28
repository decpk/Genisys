import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { organizeAndCategorize } from '../../categories/organizeAndCategorize'

export const moveFilesMatchingGlob = buildExplorerPrompt({
  id: 'p-exp-builtin-0105-move-files-matching-glob',
  categoryId: organizeAndCategorize.id,
  title: 'Move files matching a glob into a target subfolder',
  description: 'Bulk-move every file matching a glob into a destination folder.',
  sortOrder: 50,
  content: `Move every file matching glob \`{{pattern e.g. *.log}}\` into subfolder \`{{destination e.g. logs/}}\`.

**Tool note:** \`find_files\` defaults to \`max_depth=0\` (current folder only). \`create_folder\` succeeds silently if the path already exists. \`move_item\` **fails if the destination already exists** — plan around collisions.

1. Call \`find_files pattern="{{pattern}}" max_depth=0\` (raise depth only if the user explicitly asks to recurse).
2. For each match, call \`get_file_info\` to capture size and modified date.
3. Present the candidate list as a table (\`Source path | Size | Modified\`) with total count and total size.
4. Detect collisions ahead of time: if \`{{destination}}\` already contains a file with the same basename, mark the source row as \`COLLISION\`.
5. Ask for confirmation. Plan should mention: (a) create \`{{destination}}\` if missing, (b) how to handle collisions (skip / suffix-rename / abort).
6. After \`CONFIRMED\`:
   - \`create_folder folder_path="{{destination}}"\` (no-op if exists).
   - For each non-colliding match, \`move_item source=<src> destination="{{destination}}/<basename>"\`.
   - For colliding matches: either skip and report, or append \` (1)\`/\` (2)\`/… to the basename per the user's choice.
7. Report final summary: \`N moved, K skipped (collision), M already at destination, E errors\`.`,
})
