import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { projectHygiene } from '../../categories/projectHygiene'

export const listPackageScripts = buildExplorerPrompt({
  id: 'p-exp-builtin-0505-list-package-scripts',
  categoryId: projectHygiene.id,
  title: 'List all package.json scripts with short summaries',
  description: 'Read every package.json in the tree and inventory their scripts.',
  sortOrder: 50,
  content: `Inventory all \`package.json\` scripts in this project.

1. \`find_files "package.json"\` with \`max_depth=4\` (skip \`node_modules/\`).
2. For each match, \`read_file\` it and extract the \`scripts\` block.
3. For each script, infer a one-line purpose from the command string (build / test / lint / dev / release / etc.).
4. Present per package (if monorepo) as a table: \`Script | Command | Purpose\`.
5. Flag potentially confusing duplicates between root and subpackages.`,
})
