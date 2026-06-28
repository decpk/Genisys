import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { organizeAndCategorize } from '../../categories/organizeAndCategorize'

export const suggestFolderStructure = buildExplorerPrompt({
  id: 'p-exp-builtin-0104-suggest-folder-structure',
  categoryId: organizeAndCategorize.id,
  title: 'Suggest a clean folder structure for this directory',
  description: 'Inspect contents and propose a tidy reorganization plan — no changes applied.',
  sortOrder: 40,
  content: `Propose a clean reorganization of this folder. **Do not move or rename anything yet** — produce a plan only.

1. \`list_directory "."\` and sample contents with \`find_files\` if it's deep.
2. Identify the dominant content type(s) (code project, downloads, media, mixed).
3. Propose:
   - 3-6 top-level subfolders with clear names
   - Which existing files/folders should land where (table: \`Current path | Proposed path | Reason\`)
   - Files that should stay at the root (e.g. \`README.md\`, \`package.json\`)
4. Flag anything ambiguous and call out files you would skip.
5. End with: "If you'd like to apply this plan, reply with which sections to execute."`,
})
