import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { duplicatesAndCleanup } from '../../categories/duplicatesAndCleanup'

export const findEmptyFilesAndFolders = buildExplorerPrompt({
  id: 'p-exp-builtin-0203-find-empty-files-and-folders',
  categoryId: duplicatesAndCleanup.id,
  title: 'Find empty files and empty folders',
  description: 'Locate zero-byte files and folders that contain no children.',
  sortOrder: 30,
  content: `Audit this directory tree for empty files and empty folders.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, \`target\`, \`dist\`, \`.next\`, \`__pycache__\`) are auto-skipped by the tool, so you don't need to filter those out manually.

1. \`find_files pattern="**/*" max_depth=4\`. If the result count is exactly 100, do a second pass at a tighter depth or per-extension and merge.
2. For each entry, call \`get_file_info\` to determine \`type\` and \`size\`.
3. **Empty file**: \`type == "file"\` and \`size == 0\`. Record \`Path | Modified date\`.
4. **Empty folder**: \`type == "folder"\`. To confirm it's empty, call \`list_directory <path>\` — if it returns zero entries, mark it as empty.
5. Present two tables — \`Empty files\` and \`Empty folders\`. Skip OS junk like \`.DS_Store\` (size 0 but expected).
6. Read-only — ask the user before deleting anything. If they confirm, call \`delete_item\` per entry and report results.`,
})
