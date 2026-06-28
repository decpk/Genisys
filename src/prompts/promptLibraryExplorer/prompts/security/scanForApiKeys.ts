import { buildExplorerPrompt } from '../../utils/buildExplorerPrompt'
import { securityAndSecrets } from '../../categories/securityAndSecrets'

export const scanForApiKeys = buildExplorerPrompt({
  id: 'p-exp-builtin-0601-scan-for-api-keys',
  categoryId: securityAndSecrets.id,
  title: 'Scan source files for hardcoded API keys / tokens',
  description: 'Sweep code files for common API key, JWT, and token patterns.',
  sortOrder: 10,
  content: `Scan this project for hardcoded API keys, tokens, and credentials.

**Tool note:** \`grep_search\` does **literal case-insensitive substring** matching only — no regex, no character classes, no quantifiers. \`include_pattern\` is a **single glob** (no comma lists). Each call returns up to **30 matches**. Plan calls accordingly and prefer short, distinctive literal prefixes that real keys are known to start with.

1. Decide which file groups to sweep. For each of \`*.ts\`, \`*.tsx\`, \`*.js\`, \`*.jsx\`, \`*.py\`, \`*.rs\`, \`*.go\`, \`*.java\`, \`*.json\`, \`*.yml\`, \`*.yaml\`, \`*.toml\`, \`.env*\` that the project actually contains (check via \`find_files\` first), run **each** of the substring sweeps below.
2. **Known-prefix vendor keys** — for each extension, run separately (\`max_depth=8\`):
   - \`grep_search pattern="sk-" include_pattern="*.ts"\` (OpenAI / Stripe live keys)
   - \`grep_search pattern="ghp_" …\` (GitHub personal access token)
   - \`grep_search pattern="github_pat_" …\` (GitHub fine-grained PAT)
   - \`grep_search pattern="AKIA" …\` (AWS access key id)
   - \`grep_search pattern="ASIA" …\` (AWS temporary access key)
   - \`grep_search pattern="xox" …\` (Slack tokens \`xoxb-\`/\`xoxp-\`/\`xoxa-\`/\`xoxs-\`)
   - \`grep_search pattern="AIza" …\` (Google API key)
   - \`grep_search pattern="eyJ" …\` (likely JWT — base64 header prefix; very noisy, treat as low confidence)
   - \`grep_search pattern="-----BEGIN " …\` (PEM block opener)
3. **Generic credential-assignment keywords** — for each extension, also run:
   - \`grep_search pattern="api_key" …\`
   - \`grep_search pattern="apikey" …\`
   - \`grep_search pattern="api-key" …\`
   - \`grep_search pattern="secret" …\`
   - \`grep_search pattern="token" …\`
   - \`grep_search pattern="password" …\`
4. For every match, look at the returned line and the file path to classify:
   - **Likely real** — value looks like a high-entropy key/token bound to a real-looking variable name, in source (not tests/fixtures).
   - **Test fixture / placeholder** — line is in \`*.test.*\`, \`*.spec.*\`, \`fixtures/\`, \`mocks/\`, or value is obviously placeholder text (\`xxx\`, \`changeme\`, \`example\`, \`your-key-here\`).
   - **False positive** — keyword used in identifiers, comments, types, or doc strings, not as a credential.
5. Present results grouped by classification as: \`File:Line | Matched literal | Snippet (redact any high-entropy value to last 4 chars) | Classification\`.
6. Cross-check each .env file: if any \`.env\`/\`.env.local\`/\`.env.*\` shows up, also note whether it's covered by \`.gitignore\` (\`grep_search pattern=".env" include_pattern=".gitignore"\`).
7. If any individual call returned exactly 30 matches, append \`(truncated)\` next to that group's count and recommend a narrower \`include_pattern\`.
8. Read-only — never modify or delete files. End with a recommended action list: rotate any real-looking keys, move secrets to env vars, ensure \`.env*\` files are ignored.`,
})
