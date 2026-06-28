import type { GitBranchesData } from '../git.types'

/**
 * Render `cmd_git_get_branches` payload as a Markdown summary. Local
 * branches show their upstream and a `← current` marker; remote branches
 * are listed plain.
 */
export function formatBranchList(data: GitBranchesData): string {
  const localLines = data.local.length === 0
    ? ['_No local branches._']
    : data.local.map((b) => {
        const upstream = b.upstream ? ` → \`${b.upstream}\`` : ''
        const current = b.isCurrent ? ' **← current**' : ''
        return `- \`${b.name}\`${upstream}${current}`
      })
  const remoteLines = data.remote.length === 0
    ? ['_No remote branches._']
    : data.remote.map((r) => `- \`${r.name}\``)
  return [
    `### Local branches (${data.local.length})`,
    localLines.join('\n'),
    '',
    `### Remote branches (${data.remote.length})`,
    remoteLines.join('\n'),
  ].join('\n')
}
