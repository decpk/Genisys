import type { GitFileHistoryEntry } from '../git.types'

/**
 * Render `cmd_get_local_file_git_history` entries as a Markdown bullet
 * list keyed by short SHA.
 */
export function formatFileHistoryOutput(
  filePath: string,
  entries: GitFileHistoryEntry[],
): string {
  if (entries.length === 0) {
    return `_No commits found for \`${filePath}\`._`
  }
  const lines = entries.map((e) => {
    const shortSha = e.hash.slice(0, 7)
    return `- \`${shortSha}\` **${escapeSubject(e.message)}** — ${e.authorName} · ${e.date}`
  })
  return [`## History for \`${filePath}\` (last ${entries.length})`, '', lines.join('\n')].join('\n')
}

function escapeSubject(subject: string): string {
  return subject.split('\n')[0].trim()
}
