import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { projectHygiene } from '../../categories/projectHygiene'

export const auditGitignore = buildExplorerPrompt({
  id: 'p-exp-builtin-0502-audit-gitignore',
  categoryId: projectHygiene.id,
  title: 'Audit .gitignore against common patterns',
  description: 'Detect common ignore entries that are missing for this project type.',
  sortOrder: 20,
  content: `Audit this project's \`.gitignore\` against common patterns for its language(s).

**Tool note:** Detect ignore-entry presence by **reading the \`.gitignore\` file content** and matching literal lines — not by \`grep_search\` (which is substring-only and could falsely match commented or partial lines).

1. \`read_file .gitignore\` (capture content; report if the file does not exist and offer to create one).
2. Detect project type(s) by checking which of these exist via \`get_file_info\` (any of these may exist; a project may be polyglot):
   - \`package.json\` → Node
   - \`Cargo.toml\` → Rust
   - \`pyproject.toml\` / \`requirements.txt\` / \`setup.py\` → Python
   - \`*.csproj\` (use \`find_files "*.csproj" max_depth=4\`) → .NET
   - \`pom.xml\` / \`build.gradle\` → JVM
   - \`Gemfile\` → Ruby
   - \`go.mod\` → Go
3. For each detected language, define the standard ignore entries and check if each appears as a non-comment line in the \`.gitignore\` content (ignore trailing slashes when comparing — \`node_modules\` and \`node_modules/\` are equivalent):
   - **Node:** \`node_modules/\`, \`dist/\`, \`build/\`, \`.env\`, \`.env.local\`, \`.env.*.local\`, \`*.log\`, \`coverage/\`, \`.DS_Store\`
   - **Rust:** \`target/\`, \`Cargo.lock\` (binaries only — keep it for libraries), \`*.pdb\`
   - **Python:** \`__pycache__/\`, \`*.pyc\`, \`.venv/\`, \`venv/\`, \`dist/\`, \`*.egg-info/\`, \`.pytest_cache/\`
   - **.NET:** \`bin/\`, \`obj/\`, \`*.user\`, \`*.suo\`
   - **JVM:** \`target/\`, \`build/\`, \`*.class\`, \`.gradle/\`
   - **Always useful:** \`.idea/\`, \`.vscode/\` (depending on team policy), \`.DS_Store\`, \`Thumbs.db\`, \`*.swp\`
4. Present a table: \`Missing entry | Why it matters | Recommended line\`. Group by language.
5. Also flag any **noise entries** in the existing \`.gitignore\` that look stale (paths to folders that no longer exist — check via \`get_file_info\`).
6. Offer to append the recommended entries. **Wait for confirmation** before any write. Editing \`.gitignore\` would require reading the current content, appending new lines, then \`create_file\` won't work (already exists) — instead, present the suggested patch as a fenced block for the user to apply manually unless they ask you to use an external editor flow.`,
})
