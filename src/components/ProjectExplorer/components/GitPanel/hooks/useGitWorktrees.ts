import { useCallback, useState } from 'react'
import type { GitWorktree } from '../GitPanel.types'

interface UseGitWorktreesReturn {
  worktrees: GitWorktree[]
  isLoading: boolean
  error: string | null
  fetch: () => void
}

export function useGitWorktrees(rootPath: string): UseGitWorktreesReturn {
  const [worktrees, setWorktrees] = useState<GitWorktree[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(() => {
    setIsLoading(true)
    setError(null)

    window.api
      .getGitWorktrees({ rootPath })
      .then((result) => {
        if (result.success && result.data) {
          setWorktrees(result.data)
        } else {
          setError(result.error ?? 'Failed to list worktrees')
          setWorktrees([])
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to list worktrees')
        setWorktrees([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [rootPath])

  return { worktrees, isLoading, error, fetch }
}
