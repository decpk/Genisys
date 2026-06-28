import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { bulkRenameAndNormalize } from '../../categories/bulkRenameAndNormalize'

export const lowercaseAndDash = buildExplorerPrompt({
  id: 'p-exp-builtin-0305-lowercase-and-dash',
  categoryId: bulkRenameAndNormalize.id,
  title: 'Lowercase filenames and replace spaces with dashes',
  description: 'Minimal normalization: lowercase + replace spaces, leave the rest alone.',
  sortOrder: 50,
  content: `Apply minimal filename normalization: lowercase everything and replace whitespace runs with a single dash. Leave underscores, dots, and other punctuation untouched.

**Tool note:** \`rename_item\` **fails if the new path already exists** — always check for collisions before issuing renames.

1. \`list_directory "."\` to enumerate files at the root.
2. For each, compute the new name: lowercase the basename and replace any run of whitespace with a single \`-\` (e.g. \`My  Big File.txt\` → \`my-big-file.txt\`).
3. Skip files that are already in this form (new name == current name).
4. Detect collisions against existing files **and** against other files in the same rename batch.
5. Show table: \`Current | New | Collision?\`.
6. Ask for confirmation. After \`CONFIRMED\`, call \`rename_item\` only for non-colliding pairs. List collisions separately for manual review.
7. Report final outcome: \`N renamed, K skipped (already normalized), C skipped (collision), E errors\`.`,
})
