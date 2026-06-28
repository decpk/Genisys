import type { GitStatusFile, GitChangeCategory } from './GitPanel.types'
import { STATUS_LABELS } from './GitPanel.constants'

export function categorizeFile(file: GitStatusFile): GitChangeCategory {
  const status = file.workTreeStatus !== ' ' ? file.workTreeStatus : file.indexStatus
  return STATUS_LABELS[status] ?? 'modified'
}

export function categorizeByIndex(file: GitStatusFile): GitChangeCategory {
  return STATUS_LABELS[file.indexStatus] ?? 'modified'
}

export function groupFilesByCategory(
  files: GitStatusFile[]
): Map<GitChangeCategory, GitStatusFile[]> {
  const groups = new Map<GitChangeCategory, GitStatusFile[]>()
  for (const file of files) {
    const category = categorizeFile(file)
    const existing = groups.get(category) ?? []
    existing.push(file)
    groups.set(category, existing)
  }
  return groups
}

export function splitStagedUnstaged(files: GitStatusFile[]): {
  staged: GitStatusFile[]
  unstaged: GitStatusFile[]
} {
  const staged: GitStatusFile[] = []
  const unstaged: GitStatusFile[] = []

  for (const file of files) {
    if (file.indexStatus !== ' ' && file.indexStatus !== '?') {
      staged.push(file)
    }
    if (file.workTreeStatus !== ' ') {
      unstaged.push(file)
    }
  }

  return { staged, unstaged }
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
