import { useCallback, useState } from 'react'

import type { GitStatusFile } from '@/components/ProjectExplorer/components/GitPanel/GitPanel.types'

import { checkTerminalGitRepo } from '../api/checkTerminalGitRepo'
import { fetchTerminalGitStatus } from '../api/fetchTerminalGitStatus'

export interface TerminalGitStatusState {
  files: GitStatusFile[]
  gitRoot: string | null
  isRepo: boolean
  isLoading: boolean
  error: string | null
  refresh: (rootPath: string) => void
}

/**
 * Owns the git-status fetch state for a single folder. Exposes an imperative
 * `refresh(rootPath)` that performs the repo check + status load and updates
 * state. Callers drive it from their own effects, keeping every `setState` out
 * of an effect inside this hook.
 */
export function useTerminalGitStatus(): TerminalGitStatusState {
  const [files, setFiles] = useState<GitStatusFile[]>([])
  const [gitRoot, setGitRoot] = useState<string | null>(null)
  const [isRepo, setIsRepo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback((rootPath: string) => {
    setIsLoading(true)
    setError(null)
    checkTerminalGitRepo(rootPath)
      .then((repo) => {
        setIsRepo(repo)
        if (!repo) {
          setFiles([])
          setGitRoot(null)
          return undefined
        }
        return fetchTerminalGitStatus(rootPath).then((data) => {
          setGitRoot(data.gitRoot)
          setFiles(data.files)
        })
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to get git status')
        setFiles([])
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { files, gitRoot, isRepo, isLoading, error, refresh }
}
