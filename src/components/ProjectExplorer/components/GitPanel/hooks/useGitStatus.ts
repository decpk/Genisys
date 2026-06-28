import { useCallback, useState } from 'react'
import type { GitStatusFile } from '../GitPanel.types'

interface UseGitStatusReturn {
  files: GitStatusFile[]
  gitRoot: string | null
  isLoading: boolean
  error: string | null
  fetch: () => void
}

export function useGitStatus(rootPath: string): UseGitStatusReturn {
  const [files, setFiles] = useState<GitStatusFile[]>([])
  const [gitRoot, setGitRoot] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(() => {
    setIsLoading(true)
    setError(null)

    window.api
      .getGitStatus({ rootPath })
      .then((result) => {
        if (result.success && result.data) {
          setFiles(result.data.files)
          setGitRoot(result.data.gitRoot)
        } else {
          setError(result.error ?? 'Failed to get git status')
          setFiles([])
        }
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to get git status')
        setFiles([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [rootPath])

  return { files, gitRoot, isLoading, error, fetch }
}
