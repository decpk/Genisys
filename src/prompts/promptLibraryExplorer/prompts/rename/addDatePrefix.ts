import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { bulkRenameAndNormalize } from '../../categories/bulkRenameAndNormalize'

export const addDatePrefix = buildExplorerPrompt({
  id: 'p-exp-builtin-0304-add-date-prefix',
  categoryId: bulkRenameAndNormalize.id,
  title: 'Add YYYY-MM-DD- date prefix to all files',
  description: "Prepend each file's modification date to its name for chronological sorting.",
  sortOrder: 40,
  content: `Prepend each file's modified date (YYYY-MM-DD) to its filename for chronological sorting.

**Tool note:** \`rename_item\` **fails if the new path already exists** — check for collisions first.

1. \`list_directory "."\` to enumerate files at the root.
2. For each file, \`get_file_info\` and read its \`modified\` ISO timestamp; take just the \`YYYY-MM-DD\` portion.
3. Skip files already prefixed with a \`YYYY-MM-DD-\` pattern (don't double-prefix).
4. Compute new name: \`<modified-date>-<original-basename>\`.
5. Detect collisions: another file in the same folder with the same target name (rare but possible if two files share both date and basename).
6. Show table: \`Current name | New name | Modified date | Conflict?\`.
7. Ask for confirmation. After \`CONFIRMED\`, call \`rename_item\` only on non-conflicting pairs.
8. Report outcome: \`N renamed, K skipped (already dated), C skipped (conflict), E errors\`.

Optional: scope to a glob like \`{{*.pdf}}\` to avoid touching unrelated files (replace step 1 with a \`find_files\` call instead).`,
})
