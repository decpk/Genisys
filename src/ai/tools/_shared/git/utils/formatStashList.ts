/**
 * Format `cmd_git_stash_list` output. The backend uses
 * `--pretty=format:%gd|%ci|%gs` so each non-empty line is
 * `<ref>|<iso8601 date>|<subject>`.
 */
export function formatStashList(raw: string): string {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0)
  if (lines.length === 0) return 'No stash entries.'
  const rows = lines.map((line) => {
    const parts = line.split('|')
    const ref = parts[0] ?? ''
    const date = parts[1] ?? ''
    const subject = parts.slice(2).join('|')
    return { ref, date: date.slice(0, 19), subject }
  })
  const wRef = Math.max(8, ...rows.map((r) => r.ref.length))
  return rows.map((r) => `${r.ref.padEnd(wRef)}  ${r.date}  ${r.subject}`).join('\n')
}
