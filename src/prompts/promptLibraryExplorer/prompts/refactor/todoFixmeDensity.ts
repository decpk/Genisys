import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { refactorAndDiscovery } from '../../categories/refactorAndDiscovery'

export const todoFixmeDensity = buildExplorerPrompt({
  id: 'p-exp-builtin-0805-todo-fixme-density',
  categoryId: refactorAndDiscovery.id,
  title: 'TODO/FIXME density per file (most-burdened files)',
  description: "Count TODO and FIXME comments per file to find code that's been deferred most often.",
  sortOrder: 50,
  content: `Find the files most burdened by \`TODO\` / \`FIXME\` / \`HACK\` markers.

**Tool note:** \`grep_search\` is case-insensitive **literal substring** match (no regex, no \`|\` alternation), \`include_pattern\` is a single glob (no comma lists), and each call caps at **30 matches**. Plan calls accordingly.

1. Detect dominant source extensions first by running \`find_files\` (\`max_depth=8\`) for each of \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\`, \`*.py\`, \`*.rs\`, \`*.go\`, \`*.java\` and pick the top 2-3 with the most files.
2. For each chosen extension, run **three separate** \`grep_search\` calls — one per marker — with \`max_depth=8\`:
   - \`grep_search pattern="TODO" include_pattern="*.ts"\`
   - \`grep_search pattern="FIXME" include_pattern="*.ts"\`
   - \`grep_search pattern="HACK" include_pattern="*.ts"\`
   …repeat per extension.
3. Aggregate counts per file (de-duplicate \`file:line\`).
4. For the top 15 files by total count, call \`get_file_info\` for size + last-modified.
5. Present table: \`Path | TODOs | FIXMEs | HACKs | Total | Size | Last modified\`.
6. If any call returned exactly 30 matches, flag \`(truncated)\` so the user knows the count for that extension is a lower bound.
7. Highlight files with total marker count > 5 — those are technical-debt hot spots.`,
})
