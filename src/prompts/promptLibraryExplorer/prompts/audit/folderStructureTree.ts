import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { auditAndInventory } from '../../categories/auditAndInventory'

export const folderStructureTree = buildExplorerPrompt({
  id: 'p-exp-builtin-0404-folder-structure-tree',
  categoryId: auditAndInventory.id,
  title: 'Render folder structure as a markdown tree',
  description: 'Generate a compact tree-style markdown view (max depth 3) of this folder.',
  sortOrder: 40,
  content: `Render this folder's structure as a markdown tree, max depth 3.

1. Start at \`.\`, recurse via \`list_directory\` up to 3 levels deep.
2. Skip \`.git\`, \`node_modules\`, \`dist\`, \`build\`, \`.next\`, \`target\`, \`__pycache__\`, \`.venv\`.
3. Output as a fenced code block:
   \`\`\`
   .
   ├── src/
   │   ├── components/
   │   └── store/
   ├── package.json
   └── README.md
   \`\`\`
4. Add file/folder counts in a one-line summary above the tree: "**N** folders · **M** files (after filtering)".`,
})
