import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { securityAndSecrets } from '../../categories/securityAndSecrets'

export const findEnvFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0602-find-env-files',
  categoryId: securityAndSecrets.id,
  title: 'Find every .env file and report what they contain',
  description: 'Locate environment files and list their key names (values redacted).',
  sortOrder: 20,
  content: `Locate every \`.env*\` file in this project and report their contents safely.

**Tool note:** \`grep_search\` is **literal case-insensitive substring** matching only.

1. \`find_files pattern=".env*" max_depth=6\`.
2. \`read_file .gitignore\` (skip step if it doesn't exist). Capture its content so we can check each \`.env*\` filename against the ignore patterns.
3. For each \`.env*\` file:
   a. \`read_file\` it.
   b. Parse line by line: ignore blank lines and lines starting with \`#\`. For each remaining line, take everything **before** the first \`=\` as the key name. **Never echo values.**
   c. Determine if it's git-ignored: a match counts if the .gitignore content contains the filename literally, \`.env\` (covers \`.env\`, \`.env.local\`, \`.env.*\` via Git pattern semantics), \`*.env\`, or \`.env.*\`.
4. Present per file:
   - Path
   - Ignored by Git? (yes / no — show which pattern matched)
   - Key names listed (sorted alphabetically, count in parens)
5. Flag any \`.env*\` file that is **not** covered by .gitignore as a high-severity secret-leak risk and recommend the exact \`.gitignore\` line to add.
6. Read-only — do not modify any \`.env*\` file or \`.gitignore\` without explicit confirmation.`,
})
