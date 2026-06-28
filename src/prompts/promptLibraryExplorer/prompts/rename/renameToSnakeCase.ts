import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { bulkRenameAndNormalize } from '../../categories/bulkRenameAndNormalize'

export const renameToSnakeCase = buildExplorerPrompt({
  id: 'p-exp-builtin-0302-rename-to-snake-case',
  categoryId: bulkRenameAndNormalize.id,
  title: 'Rename all files in folder to snake_case',
  description: 'Normalize filenames to lowercase_underscores.',
  sortOrder: 20,
  content: `Rename every file in this folder to \`snake_case\`.

**Tool note:** \`rename_item\` **fails if the new path already exists** — always check for collisions before issuing renames.

1. \`list_directory "."\` to enumerate root-level files.
2. For each, compute the new name by:
   - lowercasing the basename
   - replacing spaces, dashes, and camelCase boundaries with \`_\`
   - collapsing repeated underscores
   - preserving the extension
3. Skip already-snake_case files (new name == current name).
4. Detect collisions against existing files **and** against other files in the same rename batch (two source names might normalize to the same target).
5. Present \`Current | New | Conflict?\` as a table.
6. Ask for confirmation. After \`CONFIRMED\`, call \`rename_item\` for each **non-conflicting** pair. List conflicts separately for manual review.
7. Report final outcome: \`N renamed, K skipped (already snake), C skipped (conflict), E errors\`.`,
})
