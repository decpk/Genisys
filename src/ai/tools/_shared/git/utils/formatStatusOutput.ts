import type { GitSnapshotData } from '../git.types'
import { formatXY } from './formatXY'

/**
 * Render a `cmd_git_snapshot` payload as a Markdown summary suitable
 * for inclusion in a tool's success message.
 */
export function formatStatusOutput(snapshot: GitSnapshotData): string {
  const branchLine = snapshot.detached
    ? `**HEAD:** detached at \`${snapshot.branch || snapshot.oid?.slice(0, 7) || 'unknown'}\``
    : `**Branch:** \`${snapshot.branch || '(unknown)'}\``
  const upstreamLine = snapshot.upstream
    ? `**Upstream:** \`${snapshot.upstream}\` (ahead ${snapshot.ahead}, behind ${snapshot.behind})`
    : '**Upstream:** _none_'

  const buckets: string[] = []
  if (snapshot.merge.length > 0) {
    buckets.push(formatBucket('Merge conflicts', snapshot.merge))
  }
  if (snapshot.staged.length > 0) {
    buckets.push(formatBucket('Staged', snapshot.staged))
  }
  if (snapshot.unstaged.length > 0) {
    buckets.push(formatBucket('Unstaged', snapshot.unstaged))
  }
  if (snapshot.untracked.length > 0) {
    buckets.push(formatBucket('Untracked', snapshot.untracked))
  }
  const body = buckets.length === 0 ? '_Working tree clean._' : buckets.join('\n\n')

  return `## Git status\n\n${branchLine}\n${upstreamLine}\n\n${body}`
}

function formatBucket(
  title: string,
  files: GitSnapshotData['staged'],
): string {
  const lines = files.map((f) => {
    const rename = f.oldPath ? `${f.oldPath} → ${f.path}` : f.path
    return `- \`${rename}\` — ${formatXY(f.xy)}`
  })
  return `### ${title} (${files.length})\n${lines.join('\n')}`
}
