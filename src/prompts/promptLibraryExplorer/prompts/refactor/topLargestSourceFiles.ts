import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { refactorAndDiscovery } from '../../categories/refactorAndDiscovery'

export const topLargestSourceFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0804-top-largest-source-files',
  categoryId: refactorAndDiscovery.id,
  title: 'Top 15 largest source files by line count',
  description: 'Surface refactor candidates by counting lines in code files.',
  sortOrder: 40,
  content: `List the 15 largest source files in this project by line count.

**Tool note:** \`find_files\` accepts **one glob per call** (no \`*.{ts,tsx}\` brace expansion, no comma lists). Heavy dirs (\`node_modules\`, \`.git\`, \`target\`, \`dist\`, \`.next\`, \`__pycache__\`, \`coverage\`) are auto-skipped by the tool.

1. Call \`find_files\` **separately** for each source extension you expect to see in the project (\`max_depth=8\`). Skip extensions that return zero results:
   - \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\`, \`*.py\`, \`*.rs\`, \`*.go\`, \`*.java\`, \`*.cpp\`, \`*.c\`, \`*.h\`, \`*.swift\`, \`*.kt\`
2. Merge all returned paths into one candidate list.
3. To keep this affordable, **first call \`get_file_info\` on every candidate** and sort by **byte size** desc. Take the top 30 by size as the line-count candidates (line count and byte size correlate strongly for source code).
4. For each of those top 30, call \`read_file\` and count **non-empty** lines (skip blank lines; keep comment lines).
5. Re-sort by line count desc and take the final top 15.
6. Present a table: \`Rank | Path | Lines | Size | Last modified\`.
7. End with a one-paragraph recommendation: which 2-3 files are the strongest refactor candidates and why (size + recency + apparent role inferred from path).`,
})
