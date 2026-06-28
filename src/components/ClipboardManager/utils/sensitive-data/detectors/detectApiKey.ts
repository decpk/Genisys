import type { SensitiveMatch } from '../sensitiveData.types'

const PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /sk-[a-zA-Z0-9]{20,}/g, label: 'OpenAI Key' },
  { regex: /sk-proj-[a-zA-Z0-9_-]{40,}/g, label: 'OpenAI Project Key' },
  { regex: /ghp_[a-zA-Z0-9]{36,}/g, label: 'GitHub PAT' },
  { regex: /gho_[a-zA-Z0-9]{36,}/g, label: 'GitHub OAuth' },
  { regex: /github_pat_[a-zA-Z0-9_]{40,}/g, label: 'GitHub Fine-grained PAT' },
  { regex: /glpat-[a-zA-Z0-9\-_]{20,}/g, label: 'GitLab PAT' },
  { regex: /xoxb-[a-zA-Z0-9\-]+/g, label: 'Slack Bot Token' },
  { regex: /xoxp-[a-zA-Z0-9\-]+/g, label: 'Slack User Token' },
  { regex: /xapp-[a-zA-Z0-9\-]+/g, label: 'Slack App Token' },
  { regex: /SG\.[a-zA-Z0-9_\-]{22,}\.[a-zA-Z0-9_\-]{43,}/g, label: 'SendGrid Key' },
  { regex: /sk_live_[a-zA-Z0-9]{24,}/g, label: 'Stripe Secret Key' },
  { regex: /pk_live_[a-zA-Z0-9]{24,}/g, label: 'Stripe Publishable Key' },
  { regex: /rk_live_[a-zA-Z0-9]{24,}/g, label: 'Stripe Restricted Key' },
  { regex: /sq0atp-[a-zA-Z0-9_\-]{22,}/g, label: 'Square Access Token' },
  { regex: /npm_[a-zA-Z0-9]{36,}/g, label: 'npm Token' },
  { regex: /pypi-[a-zA-Z0-9_\-]{50,}/g, label: 'PyPI Token' },
  { regex: /hf_[a-zA-Z0-9]{34,}/g, label: 'HuggingFace Token' },
  { regex: /AIza[a-zA-Z0-9_\-]{35}/g, label: 'Google API Key' },
]

export function detectApiKey(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []

  for (const { regex, label } of PATTERNS) {
    regex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type: 'api_key',
        label,
        level: 'critical',
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}
