import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { projectHygiene } from '../../categories/projectHygiene'

export const checkMissingFiles = buildExplorerPrompt({
  id: 'p-exp-builtin-0501-check-missing-files',
  categoryId: projectHygiene.id,
  title: 'Check for missing README / .gitignore / LICENSE',
  description: 'Audit the project root for standard repo files and report which are missing.',
  sortOrder: 10,
  content: `Audit this project root for standard repository files.

**Tool note:** \`list_directory\` returns names with a \`/\` suffix for folders — use it to check presence quickly. For canonical-name + variation checks, also call \`get_file_info\` on candidate paths and treat an error response as "not present".

1. \`list_directory "."\` to see what's at the root.
2. For each of these standard files, check both the canonical name and common variants (case matters on Linux):
   - **Required:** \`README.md\` (also accept \`README\`, \`README.rst\`, \`README.txt\`)
   - **Required:** \`LICENSE\` (also accept \`LICENSE.md\`, \`LICENSE.txt\`, \`COPYING\`)
   - **Required:** \`.gitignore\`
   - **Required by project type** (check which applies):
     - Node → \`package.json\`
     - Rust → \`Cargo.toml\`
     - Python → \`pyproject.toml\` or \`setup.py\` or \`requirements.txt\`
     - Go → \`go.mod\`
   - **Recommended:** \`CONTRIBUTING.md\`, \`CHANGELOG.md\`, \`CODE_OF_CONDUCT.md\`, \`SECURITY.md\`
3. For each missing file, propose:
   - Whether to create it now (yes for required, ask for recommended).
   - A short starter template (the AI may sketch one for the user to review).
4. Present a checklist: \`File | Present? | Severity (required/recommended) | Notes\`.
5. Read-only — do not call \`create_file\` until the user picks which templates to apply.`,
})
