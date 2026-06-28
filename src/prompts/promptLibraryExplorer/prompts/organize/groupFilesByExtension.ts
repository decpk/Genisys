import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { organizeAndCategorize } from '../../categories/organizeAndCategorize'

export const groupFilesByExtension = buildExplorerPrompt({
  id: 'p-exp-builtin-0101-group-by-extension',
  categoryId: organizeAndCategorize.id,
  title: 'Group files by extension into subfolders',
  description: 'Sort loose files into typed subfolders (images/, docs/, code/, archives/).',
  sortOrder: 10,
  content: `Tidy this folder by grouping loose files into typed subfolders.

1. Use \`list_directory\` with path "." to see what's at the root.
2. Group every file by extension family:
   - \`images/\` → png, jpg, jpeg, gif, webp, svg, heic
   - \`docs/\`   → pdf, docx, doc, txt, md, rtf, odt
   - \`code/\`   → ts, tsx, js, jsx, py, rs, go, java, cpp, c, h
   - \`archives/\` → zip, tar, gz, 7z, rar
   - \`data/\`   → csv, json, xml, yaml, yml, sql
   - \`media/\`  → mp3, mp4, mov, wav, webm
   - \`misc/\`   → everything else (only if non-empty)
3. Present the proposed grouping as a table (\`Target folder | File count | Example files\`).
4. Skip files already inside a subfolder — only operate on root-level files.
5. Ask for confirmation before creating folders or moving files.`,
})
