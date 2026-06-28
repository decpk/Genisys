import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { refactorAndDiscovery } from '../../categories/refactorAndDiscovery'

export const findDeadFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0803-find-dead-files',
  categoryId: refactorAndDiscovery.id,
  title: 'Find candidate dead files (no incoming imports)',
  description: 'Heuristically detect source files that are not imported anywhere else.',
  sortOrder: 30,
  content: `Detect candidate dead files in this project (files no other file imports).

**Tool note:** \`find_files\` accepts **one glob per call** (no comma lists). \`grep_search\` is **literal case-insensitive substring** matching with a **30-match cap per call**. This is a heuristic — dynamic imports, runtime \`require\`, re-exports, and CSS/asset references won't be detected.

1. Enumerate source files by calling \`find_files\` separately for each extension that exists in the project (\`max_depth=8\`):
   - \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\` (run one call per extension; heavy dirs like \`node_modules\`, \`dist\`, \`build\`, \`.git\` are auto-skipped by the tool).
2. Build a candidate set. **Exclude obvious entry points and non-importable files** up front:
   - File basename equals \`main.tsx\`, \`main.ts\`, \`index.tsx\`, \`index.ts\`, \`index.js\`, \`App.tsx\`, \`App.ts\`
   - File ends in \`.test.ts(x)\`, \`.spec.ts(x)\`, \`.stories.ts(x)\`, \`.d.ts\`
   - File is in \`__tests__/\`, \`__mocks__/\`, \`scripts/\`, \`bin/\`
3. To keep tool calls reasonable, **cap the candidate set to the 30 oldest / largest / least-recently-modified** files (use \`get_file_info\` once to sort, then truncate). Call this out to the user as a sampling strategy.
4. For each capped candidate, compute its **module key** — the filename **without extension** (e.g. \`useDashboardCardData.ts\` → \`useDashboardCardData\`). Then call \`grep_search\`:
   - \`grep_search pattern="<moduleKey>" include_pattern="*.ts" max_depth=8\`
   - Repeat for each existing extension (\`*.tsx\`, \`*.js\`, \`*.jsx\`).
5. For each candidate, count import-like hits in the returned lines (look for \`import \`, \`from \`, or \`require(\` on the matching line) and subtract the candidate's own file (self-reference doesn't count).
6. Classify:
   - **High confidence dead** — 0 import-like hits and module key is distinctive (≥6 chars, not a common word).
   - **Medium confidence** — 0 import-like hits but module key is short/common (≤5 chars) or the file exports nothing visible.
   - **Low confidence** — ≥1 import-like hit but only via dynamic or unusual pattern.
7. Present table: \`Path | Size | Last modified | Confidence | Notes\`.
8. End with a caveat block: "Heuristic only. The following will produce false dead-file hits: re-exports via barrel files, dynamic \`import()\`, CSS/SVG imports, path-aliased imports that don't contain the basename. Verify before deleting anything."
9. Read-only — never delete anything from this prompt.`,
})
