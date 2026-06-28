import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { projectHygiene } from '../../categories/projectHygiene'

export const findDuplicateBasenames = buildExplorerPrompt({
  id: 'p-exp-builtin-0504-find-duplicate-basenames',
  categoryId: projectHygiene.id,
  title: 'Find duplicate basenames across folders',
  description: 'Surface filenames that appear in multiple folders (potential confusion source).',
  sortOrder: 40,
  content: `Find filenames that appear in more than one folder across this project.

**Tool note:** \`find_files\` returns both files and folders and caps at **100 results per call**. Heavy dirs (\`node_modules\`, \`.git\`, \`dist\`, build outputs) are auto-skipped by the tool.

1. \`find_files pattern="**/*" max_depth=6\`. If the result count is exactly 100, follow up with per-extension passes (\`*.ts\`, \`*.tsx\`, \`*.md\`, \`*.json\`, etc.) and merge to widen coverage.
2. Filter out folders (proxy: keep only entries whose basename contains a \`.\`, unless the user wants folder collisions too).
3. Group remaining files by basename.
4. Report any basename appearing in 2+ folders, sorted by collision count desc.
5. Present as a table: \`Basename | Folder count | Paths (first 5)\`.
6. Annotate each row: many \`index.ts\` / \`README.md\` / \`package.json\` collisions are expected; flag unexpected ones like two \`utils.ts\` in unrelated feature folders that may indicate naming drift.
7. Read-only — propose merges/renames only; do not act.`,
})
