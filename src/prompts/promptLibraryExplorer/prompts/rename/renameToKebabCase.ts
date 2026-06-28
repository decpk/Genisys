import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { bulkRenameAndNormalize } from '../../categories/bulkRenameAndNormalize'

export const renameToKebabCase = buildExplorerPrompt({
  id: 'p-exp-builtin-0301-rename-to-kebab-case',
  categoryId: bulkRenameAndNormalize.id,
  title: 'Rename all files in folder to kebab-case',
  description: "Normalize messy filenames to lowercase-dashes (e.g. 'My File.png' → 'my-file.png').",
  sortOrder: 10,
  content: `Rename every file in this folder to \`kebab-case\`.

**Tool note:** \`rename_item\` **fails if the new path already exists** — always check for collisions before issuing renames.

1. \`list_directory "."\` to enumerate files at the root.
2. For each file, compute the new name by:
   - lowercasing the basename
   - replacing spaces, underscores, and camelCase boundaries with \`-\`
   - collapsing repeated dashes
   - preserving the original extension exactly
3. Skip files that are already kebab-case (new name == current name).
4. For each non-skip file, check whether the new name **already exists** in the folder (it appears in \`list_directory\` output or another file in the rename batch resolves to the same new name).
5. Show a table: \`Current name | New name | Conflict?\` (mark conflicts vs existing files **and** intra-batch collisions).
6. Ask for confirmation. After \`CONFIRMED\`, call \`rename_item\` only for the non-conflicting pairs. Skip conflicts and list them for manual review.
7. Report final outcome: \`N renamed, K skipped (already kebab), C skipped (conflict), E errors\`.`,
})
