import { useCallback, useState } from 'react'

import { invokeGitDiff } from '@/ai/tools/_shared/git/api/invokeGitDiff'
import type { GitDiffSide } from '@/ai/tools/_shared/git/git.types'

export interface TerminalGitDiffContent {
  original: string
  modified: string
  language: string
  isLoading: boolean
  error: string | null
  load: (gitRoot: string, file: string, side: GitDiffSide) => void
}

/**
 * Loads a single file's git diff (original/modified/language). Exposes an
 * imperative `load(...)`; the caller drives it from an effect, so no `setState`
 * runs inside an effect within this hook.
 */
export function useTerminalGitDiffContent(): TerminalGitDiffContent {
  const [original, setOriginal] = useState('')
  const [modified, setModified] = useState('')
  const [language, setLanguage] = useState('plaintext')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((gitRoot: string, file: string, side: GitDiffSide) => {
    setIsLoading(true)
    setError(null)
    invokeGitDiff({ rootPath: gitRoot, file, side })
      .then((data) => {
        setOriginal(data.original)
        setModified(data.modified)
        setLanguage(data.language)
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load diff')
        setOriginal('')
        setModified('')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { original, modified, language, isLoading, error, load }
}
