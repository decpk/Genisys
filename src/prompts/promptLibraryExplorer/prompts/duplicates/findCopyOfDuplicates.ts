import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { duplicatesAndCleanup } from '../../categories/duplicatesAndCleanup'

export const findCopyOfDuplicates = buildExplorerPrompt({
  id: 'p-exp-builtin-0202-find-copy-of-duplicates',
  categoryId: duplicatesAndCleanup.id,
  title: `Find 'Copy of …' and ' (1)' duplicate files`,
  description: 'Surface filenames that look like accidental duplicates produced by Finder/Explorer/save dialogs.',
  sortOrder: 20,
  content: `Find probable accidental duplicates in this folder by filename pattern.

**Tool note:** \`find_files\` accepts **one glob per call** (no comma lists, no brace expansion). Run each pattern separately and merge results.

1. Run \`find_files\` **separately for each pattern** with \`max_depth=3\` (raise depth if the user wants a deeper scan):
   - \`Copy of *\`
   - \`* copy.*\`, \`* copy 2.*\`, \`* copy 3.*\`
   - \`* (1).*\`, \`* (2).*\`, \`* (3).*\`
   - \`*-Copy.*\`, \`*_copy.*\`
   - \`*.bak\`, \`*.old\`
2. For each match, compute the **canonical original name** by stripping the duplicate suffix/prefix (e.g. \`Copy of report.pdf\` → \`report.pdf\`; \`photo (1).jpg\` → \`photo.jpg\`).
3. Check whether the original exists at the same path: call \`get_file_info\` on the computed original path. If it returns an error, the original is missing.
4. Also \`get_file_info\` the duplicate itself to capture its size.
5. Present a table: \`Duplicate path | Size | Original exists? | Original path\`.
6. Split into two groups:
   - **Safe to delete** — original exists. Subtotal reclaimable size.
   - **Needs review** — no original found, may not actually be a duplicate.
7. Do not delete anything from this prompt. Ask the user which group (if any) to clean up; on \`CONFIRMED\`, call \`delete_item\` on the chosen entries and report.`,
})
