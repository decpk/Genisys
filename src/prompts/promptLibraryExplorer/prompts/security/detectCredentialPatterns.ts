import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { securityAndSecrets } from '../../categories/securityAndSecrets'

export const detectCredentialPatterns = buildExplorerPrompt({
  id: 'p-exp-builtin-0604-detect-credential-patterns',
  categoryId: securityAndSecrets.id,
  title: 'Detect committed credential file patterns (.pem, .key, .pfx)',
  description: 'Locate certificate/key files that should rarely (if ever) be committed.',
  sortOrder: 40,
  content: `Find committed credential / key files that probably should not be in the repo.

**Tool note:** \`find_files\` accepts **one glob per call** (no comma lists). \`read_file\` accepts optional \`start_line\` / \`end_line\` (1-based) — use them to peek at just the first few lines of large files. \`grep_search\` is **literal case-insensitive substring** matching.

1. Run \`find_files\` (max_depth=8) **separately** for each pattern: \`*.pem\`, \`*.key\`, \`*.pfx\`, \`*.p12\`, \`*.cer\`, \`*.crt\`, \`id_rsa\`, \`id_ed25519\`, \`*.kdbx\`, \`*.keystore\`, \`*.jks\`.
2. For each match, call \`read_file file_path=<path> start_line=1 end_line=5\` and check if the first lines start with \`-----BEGIN \` (real PEM/PKCS body) vs an obvious placeholder/example/empty file.
3. Cross-check ignore status. Read \`.gitignore\` once via \`read_file .gitignore\`. For each credential file, check whether its basename, extension pattern (\`*.pem\`), or path appears literally in the .gitignore content.
4. Present a table: \`Path | Type | Looks like a real key? | In .gitignore? | Why it matters\`.
5. Severity scoring:
   - **HIGH** — real-looking key, **not** ignored by Git
   - **MEDIUM** — real-looking key, ignored by Git (still concerning if previously committed)
   - **LOW** — placeholder/example file
6. Read-only — do not delete anything. End with concrete remediation steps (rotate the key, \`git filter-repo\` to scrub history, add to \`.gitignore\`).`,
})
