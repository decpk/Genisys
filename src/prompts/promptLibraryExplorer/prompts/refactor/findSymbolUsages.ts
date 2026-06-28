import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { refactorAndDiscovery } from '../../categories/refactorAndDiscovery'

export const findSymbolUsages = buildExplorerPrompt({
  id: 'p-exp-builtin-0801-find-symbol-usages',
  categoryId: refactorAndDiscovery.id,
  title: 'Find all usages of a symbol across the codebase',
  description: 'Locate every reference to a function/class/variable name with file:line context.',
  sortOrder: 10,
  content: `Find every usage of the symbol \`{{symbolName}}\` across this codebase.

**Tool note:** \`grep_search\` is **literal case-insensitive substring** matching — no regex, no \`\\b\` word boundaries. That means a search for \`foo\` will also match \`foobar\`, \`barfoo\`, the word inside strings/comments, etc. The AI must filter false positives by looking at each returned line. Each call also caps at **30 matches** and \`include_pattern\` is a **single glob**.

1. Pick the file groups to sweep. For each of \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\`, \`*.py\`, \`*.rs\`, \`*.go\`, \`*.java\` that the project contains (check via \`find_files\` first), call separately:
   - \`grep_search pattern="{{symbolName}}" include_pattern="*.ts" max_depth=8\`
   …repeat per extension that exists.
2. For each returned line, decide whether the match is a **true word-boundary hit** (e.g. \`{{symbolName}}(\`, \`{{symbolName}}.\`, \`{{symbolName}},\`, \`{{symbolName}} \`, \`{{symbolName}}\\n\`, or surrounded by whitespace/punctuation) vs a **substring false positive** (e.g. inside \`my{{symbolName}}Variant\`). Discard substring-only matches.
3. Classify each surviving match per file:
   - **Definition** — line contains \`export\`, \`function {{symbolName}}\`, \`class {{symbolName}}\`, \`const {{symbolName}}\`, \`def {{symbolName}}\`, \`fn {{symbolName}}\`, etc.
   - **Import** — line starts with or contains \`import \`, \`from \`, or \`require(\`.
   - **Usage** — anything else (call site, reference, type position).
4. Present a table: \`Path | # defs | # imports | # usages | First 3 line:snippets\`. Sort by total usage count desc.
5. End with: \`Found N total true matches across F files (D definitions, I imports, U usages). Discarded X substring-only false positives.\`
6. If any grep call hit the 30-match cap, append \`(possibly more in <extension>)\` to that group's row.`,
})
