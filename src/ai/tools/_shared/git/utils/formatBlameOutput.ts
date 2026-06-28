import type { GitBlameData } from '../git.types'

/**
 * Render `cmd_git_blame` output as a per-line list. Each line links to
 * its commit's short SHA + summary; the commit map is summarised under
 * a `### Commits` heading.
 */
export function formatBlameOutput(
  filePath: string,
  startLine: number,
  endLine: number,
  data: GitBlameData,
): string {
  const lineRows = data.lines.map((l) => {
    const c = data.commits[l.sha]
    const label = c ? `${c.shortSha} ${escapeSubject(c.summary)} — ${c.author}` : l.sha.slice(0, 7)
    return `- L${l.line}: ${label}`
  })
  const commitRows = Object.values(data.commits).map((c) => {
    const refs = formatCommitRefs(c.prNumber)
    return `- \`${c.shortSha}\` — **${escapeSubject(c.summary)}** — ${c.author} <${c.authorEmail}>${refs}`
  })
  return [
    `## Blame for \`${filePath}\` lines ${startLine}–${endLine}`,
    '',
    '### Lines',
    lineRows.join('\n'),
    '',
    `### Commits (${commitRows.length})`,
    commitRows.join('\n'),
  ].join('\n')
}

function escapeSubject(subject: string): string {
  return subject.split('\n')[0].trim()
}

function formatCommitRefs(prNumber?: number): string {
  const parts: string[] = []
  if (typeof prNumber === 'number') parts.push(`PR #${prNumber}`)
  return parts.length === 0 ? '' : ` _(${parts.join(', ')})_`
}
