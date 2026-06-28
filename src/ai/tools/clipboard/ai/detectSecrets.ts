import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const SECRET_PATTERNS: Array<{ name: string; pattern: RegExp; severity: 'critical' | 'high' | 'medium' }> = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/, severity: 'critical' },
  { name: 'AWS Secret Key', pattern: /(?:aws_secret_access_key|secret_key)\s*[=:]\s*["']?[A-Za-z0-9/+=]{40}/, severity: 'critical' },
  { name: 'GitHub Token', pattern: /gh[ps]_[A-Za-z0-9_]{36,}/, severity: 'critical' },
  { name: 'GitHub Token (fine-grained)', pattern: /github_pat_[A-Za-z0-9_]{22,}/, severity: 'critical' },
  { name: 'Generic API Key', pattern: /(?:api[_-]?key|apikey)\s*[=:]\s*["']?[A-Za-z0-9_\-]{20,}/, severity: 'high' },
  { name: 'Generic Secret', pattern: /(?:secret|password|passwd|token)\s*[=:]\s*["']?[A-Za-z0-9_\-!@#$%^&*]{8,}/, severity: 'high' },
  { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/, severity: 'high' },
  { name: 'Private Key', pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/, severity: 'critical' },
  { name: 'Slack Token', pattern: /xox[bpors]-[A-Za-z0-9-]+/, severity: 'critical' },
  { name: 'Stripe Key', pattern: /sk_(?:live|test)_[A-Za-z0-9]{24,}/, severity: 'critical' },
  { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9]{32,}/, severity: 'critical' },
  { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_\-+/=]{10,}/, severity: 'high' },
  { name: 'Connection String', pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^\s"']+@[^\s"']+/, severity: 'critical' },
  { name: 'Credit Card (Visa)', pattern: /\b4[0-9]{15}\b/, severity: 'critical' },
  { name: 'Credit Card (Mastercard)', pattern: /\b5[1-5][0-9]{14}\b/, severity: 'critical' },
  { name: 'SSN (US)', pattern: /\b\d{3}-\d{2}-\d{4}\b/, severity: 'critical' },
  { name: 'Google API Key', pattern: /AIza[A-Za-z0-9_\-]{35}/, severity: 'high' },
  { name: 'NPM Token', pattern: /npm_[A-Za-z0-9]{36}/, severity: 'high' },
  { name: 'Env Variable Assignment', pattern: /(?:export\s+)?[A-Z_]{3,}(?:_KEY|_SECRET|_TOKEN|_PASSWORD)\s*=\s*["']?[^\s"']{6,}/, severity: 'medium' },
]

const tool: ToolModule = {
  name: 'clipboard_detect_secrets',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_detect_secrets',
      description:
        'Scan clipboard items for accidentally copied secrets, credentials, API keys, tokens, private keys, passwords, credit card numbers, and other sensitive data. Acts as a security guardian for your clipboard.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of items to scan. Defaults to 200.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const limit = (args.limit as number) || 200

    try {
      const result = await window.api.loadClipboardItems({ limit })
      const items = result.items as Array<{
        id: string
        contentType: 'text' | 'image'
        textContent: string | null
        createdAt: string
      }>

      const textItems = items.filter((i) => i.contentType === 'text' && i.textContent)

      const findings: Array<{
        itemId: string
        time: string
        secretType: string
        severity: 'critical' | 'high' | 'medium'
        preview: string
      }> = []

      for (const item of textItems) {
        const text = item.textContent!
        for (const { name, pattern, severity } of SECRET_PATTERNS) {
          if (pattern.test(text)) {
            const match = text.match(pattern)
            const matched = match?.[0] ?? ''
            // Mask the secret — show first 4 and last 2 chars only
            const masked = matched.length > 8
              ? matched.slice(0, 4) + '•'.repeat(Math.min(matched.length - 6, 20)) + matched.slice(-2)
              : '•'.repeat(matched.length)
            findings.push({
              itemId: item.id,
              time: new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
              secretType: name,
              severity,
              preview: masked,
            })
          }
        }
      }

      if (findings.length === 0) {
        return { kind: 'success', message: `✅ **No secrets detected** across ${textItems.length} text items scanned. Your clipboard looks clean.` }
      }

      const critical = findings.filter((f) => f.severity === 'critical')
      const high = findings.filter((f) => f.severity === 'high')
      const medium = findings.filter((f) => f.severity === 'medium')

      const parts: string[] = []
      parts.push(`## 🚨 Security Scan Results`)
      parts.push(`Scanned ${textItems.length} text items — **${findings.length} potential secret(s) found**`)
      parts.push('')

      if (critical.length > 0) {
        parts.push(`### 🔴 Critical (${critical.length})`)
        for (const f of critical) {
          parts.push(`- **${f.secretType}** — \`${f.preview}\` (${f.time}) — ID: ${f.itemId}`)
        }
        parts.push('')
      }
      if (high.length > 0) {
        parts.push(`### 🟠 High (${high.length})`)
        for (const f of high) {
          parts.push(`- **${f.secretType}** — \`${f.preview}\` (${f.time}) — ID: ${f.itemId}`)
        }
        parts.push('')
      }
      if (medium.length > 0) {
        parts.push(`### 🟡 Medium (${medium.length})`)
        for (const f of medium) {
          parts.push(`- **${f.secretType}** — \`${f.preview}\` (${f.time}) — ID: ${f.itemId}`)
        }
        parts.push('')
      }

      parts.push('### ⚡ Recommended Actions')
      if (critical.length > 0) {
        parts.push('- **Rotate** any critical credentials immediately')
        parts.push('- **Delete** these clipboard items using clipboard_delete_item')
      }
      parts.push('- Review each finding and determine if the secret is still active')
      parts.push('- Consider using a password manager instead of copy-pasting credentials')

      return { kind: 'success', message: parts.join('\n') }
    } catch (e) {
      return { kind: 'error', message: `Scan failed: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

export default tool
