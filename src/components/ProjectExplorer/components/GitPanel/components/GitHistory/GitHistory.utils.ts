import type { GitCommit } from '../../GitPanel.types'

export interface CommitGroup {
  label: string
  commits: GitCommit[]
}

export function groupCommitsByDate(commits: GitCommit[]): CommitGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups = new Map<string, GitCommit[]>()
  const order: string[] = []

  for (const commit of commits) {
    const date = new Date(commit.date)
    const commitDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    let label: string
    if (commitDay >= today) {
      label = 'Today'
    } else if (commitDay >= yesterday) {
      label = 'Yesterday'
    } else if (commitDay >= weekAgo) {
      label = 'This Week'
    } else {
      label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    if (!groups.has(label)) {
      groups.set(label, [])
      order.push(label)
    }
    groups.get(label)!.push(commit)
  }

  return order.map((label) => ({ label, commits: groups.get(label)! }))
}
