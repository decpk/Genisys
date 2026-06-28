import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { bulkRenameAndNormalize } from '../../categories/bulkRenameAndNormalize'

export const stripCopyOfSuffix = buildExplorerPrompt({
  id: 'p-exp-builtin-0303-strip-copy-of-suffix',
  categoryId: bulkRenameAndNormalize.id,
  title: "Strip 'Copy of …' / ' (1)' suffixes from filenames",
  description: 'Clean up filenames that accumulated dup suffixes from OS save dialogs.',
  sortOrder: 30,
  content: `Clean up filenames that picked up duplicate-suffix noise.

**Tool note:** \`find_files\` accepts **one glob per call** (no comma lists). \`rename_item\` **fails if the new path already exists** — always check first.

1. Run \`find_files\` **separately for each pattern** with \`max_depth=0\` (raise depth if the user wants recursive cleanup):
   - \`Copy of *\`, \`* copy.*\`, \`* copy 2.*\`
   - \`* (1).*\`, \`* (2).*\`
   - \`*-Copy.*\`
2. For each match, compute the cleaned filename by removing the suffix/prefix marker (\`Copy of report.pdf\` → \`report.pdf\`; \`photo (1).jpg\` → \`photo.jpg\`).
3. Check whether the cleaned name already exists in the same folder: call \`get_file_info\` on the cleaned path. An error response means the path is free.
4. Show table: \`Current name | Cleaned name | Cleaned name exists?\`.
5. Ask for confirmation. After \`CONFIRMED\`, call \`rename_item old_path=<current> new_path=<cleaned>\` only for rows where the cleaned name is **free**.
6. For rows where the cleaned name **already exists**, list them separately for manual review (the user may want to compare-and-delete one).
7. Report final outcome: \`N renamed, K skipped (collision), E errors\`.`,
})
