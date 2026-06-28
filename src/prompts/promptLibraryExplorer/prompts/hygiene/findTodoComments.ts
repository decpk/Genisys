import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { projectHygiene } from '../../categories/projectHygiene'

export const findTodoComments = buildExplorerPrompt({
  id: 'p-exp-builtin-0503-find-todo-comments',
  categoryId: projectHygiene.id,
  title: 'Find all TODO / FIXME / HACK / XXX comments',
  description: 'Sweep source files for actionable comments and present them grouped by file.',
  sortOrder: 30,
  content: `Sweep this project for actionable comment markers.

**Tool note:** \`grep_search\` does literal **case-insensitive substring matching** (no regex, no \`|\` alternation). Its \`include_pattern\` accepts **one glob only** (no comma lists). It caps at **30 matches per call** and skips files >2 MB and known heavy dirs (\`node_modules\`, \`.git\`, \`target\`, \`dist\`, \`.next\`, \`__pycache__\`).

1. First detect the dominant source extensions with quick \`find_files\` counts (\`max_depth=8\`) for: \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\`, \`*.py\`, \`*.rs\`, \`*.go\`, \`*.java\`. Pick the top 2-3 extensions present and call each \`find_files\` independently — \`*.{ts,tsx}\` is **not** valid here.
2. For each of the chosen extensions, run **four separate** \`grep_search\` calls (\`max_depth=8\`), one per marker, using the literal text only:
   - \`grep_search pattern="TODO" include_pattern="*.ts" max_depth=8\`
   - \`grep_search pattern="FIXME" include_pattern="*.ts" max_depth=8\`
   - \`grep_search pattern="HACK" include_pattern="*.ts" max_depth=8\`
   - \`grep_search pattern="XXX" include_pattern="*.ts" max_depth=8\`
   …repeat for each chosen extension.
3. De-duplicate by \`file:line\` (the same line will hit if it contains multiple markers).
4. Group by file. Present per file: \`Line | Marker | Snippet\`.
5. Add a top-line summary: \`N markers across F files (TODO: x, FIXME: y, HACK: z, XXX: w)\`.
6. If any call returned exactly 30 results, note \`(results truncated — re-run with a tighter include_pattern to see more)\`.
7. Suggest the top 3 highest-value items to address first based on snippet context.`,
})
