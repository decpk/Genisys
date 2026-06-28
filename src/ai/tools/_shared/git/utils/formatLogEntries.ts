import type { GitLogEntry } from '../git.types'

/**
 * Format `cmd_get_git_log` entries as a Markdown table-ish list. Each
 * entry shows short SHA, subject, author and ISO date — enough for the
 * LLM to reason about ordering without flooding context.
 */
export function formatLogEntries(entries: GitLogEntry[]): string {
  if (entries.length === 0) return '_No commits._'
  const lines = entries.map((e) => {
    const shortSha = e.hash.slice(0, 7)
    const refs = e.refs ? ` _(${e.refs})_` : ''
    return `- \`${shortSha}\`${refs} **${escapeSubject(e.message)}** — ${e.authorName} · ${e.date}`
  })
  return lines.join('\n')
}

/** Strip newlines so a multi-line subject doesn't break the bullet list. */
function escapeSubject(subject: string): string {
  return subject.split('\n')[0].trim()
}
