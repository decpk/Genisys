import type { RepoInfo } from './ProjectExplorer.types'

const LAST_REPO_KEY = 'genisys:explorer:last-repo'

function isValidRepoInfo(value: unknown): value is RepoInfo {
  if (!value || typeof value !== 'object') return false
  const repo = value as Record<string, unknown>
  if (repo.source !== 'local') return false
  if (typeof repo.repository !== 'string') return false
  if (typeof repo.organization !== 'string') return false
  if (typeof repo.project !== 'string') return false
  if (repo.source === 'local' && typeof repo.localPath !== 'string') return false
  return true
}

export function getLastRepo(): RepoInfo | null {
  try {
    const raw = localStorage.getItem(LAST_REPO_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isValidRepoInfo(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setLastRepo(repo: RepoInfo): void {
  try {
    localStorage.setItem(LAST_REPO_KEY, JSON.stringify(repo))
  } catch {
    // Ignore storage errors (quota, private mode, etc.)
  }
}
