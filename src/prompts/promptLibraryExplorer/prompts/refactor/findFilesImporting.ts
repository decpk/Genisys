import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { refactorAndDiscovery } from '../../categories/refactorAndDiscovery'

export const findFilesImporting = buildExplorerPrompt({
  id: 'p-exp-builtin-0802-find-files-importing',
  categoryId: refactorAndDiscovery.id,
  title: 'Find every file that imports a given module',
  description: 'List the reverse-dependency set of a module — useful before refactor/rename.',
  sortOrder: 20,
  content: `Find every file that imports from \`{{modulePath e.g. ./utils/foo}}\`.

**Tool note:** \`grep_search\` does **literal case-insensitive substring** matching only — no regex, no \`.*\`, no escaping needed for special chars. \`include_pattern\` is a **single glob** (no comma lists). Each call caps at **30 matches**.

1. For each of \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\` that exists in the project (check via \`find_files\` first), run **four separate** \`grep_search\` calls per extension to cover quote styles and import syntax (\`max_depth=8\`):
   - \`grep_search pattern="from '{{modulePath}}'" include_pattern="*.ts"\`
   - \`grep_search pattern="from \\"{{modulePath}}\\"" include_pattern="*.ts"\`
   - \`grep_search pattern="require('{{modulePath}}')" include_pattern="*.ts"\`
   - \`grep_search pattern="require(\\"{{modulePath}}\\")" include_pattern="*.ts"\`
   …repeat per extension.
2. De-duplicate by \`file:line\` and merge into one result set.
3. For each importing file, classify the import style from the returned line text:
   - **Named** — \`import { X, Y } from\`
   - **Default** — \`import X from\`
   - **Namespace** — \`import * as X from\`
   - **Side-effect** — \`import '{{modulePath}}'\` (no \`from\`)
   - **Dynamic** — \`import('{{modulePath}}')\` or \`require(\`
4. Present table: \`Importing file | Style | Imported names | Line snippet\`.
5. Add a one-line summary: \`N files import this module across E extensions.\`
6. Call out anything unusual — deep imports into internals, side-effect-only imports, dynamic/conditional imports.
7. If any call returned exactly 30 matches, note the cap and suggest narrowing the \`include_pattern\` to one extension at a time.`,
})
