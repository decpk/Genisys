import { useState } from 'react'
import { Search, FolderOpen, X } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('explorer')

import { Button } from '@/components/ui/button'
import type { RepoInfo } from '../ProjectExplorer.types'

interface RepoUrlInputProps {
  onSubmit: (repo: RepoInfo) => void
  isLoading: boolean
  compact?: boolean
}

export function RepoUrlInput({
  onSubmit,
  isLoading,
  compact
}: RepoUrlInputProps): React.JSX.Element {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isLocalPath = (value: string): boolean => {
    const trimmed = value.trim()
    return trimmed.startsWith('/') || trimmed.startsWith('~') || trimmed.startsWith('./')
  }

  const handleSubmit = (): void => {
    const trimmed = url.trim()

    if (isLocalPath(trimmed)) {
      setError(null)
      const folderName = trimmed.split('/').pop() || trimmed
      onSubmit({
        organization: '',
        project: '',
        repository: folderName,
        source: 'local',
        localPath: trimmed
      })
      return
    }

    setError(
      'Enter a local directory path (e.g. /Users/you/repo) or use Browse to pick a folder.'
    )
  }

  const handleBrowseLocal = async (): Promise<void> => {
    try {
      const result = await window.api.selectLocalRepo()
      if (!result.success || !result.data) {
        if (result.error && result.error !== 'No directory selected') {
          toast.error(result.error)
        }
        return
      }

      const localPath = result.data
      const folderName = localPath.split('/').pop() || localPath

      onSubmit({
        organization: '',
        project: '',
        repository: folderName,
        source: 'local',
        localPath
      })
    } catch {
      toast.error('Failed to open directory picker')
    }
  }

  return (
    <div
      className={`flex flex-col items-center gap-4 ${compact ? 'pt-2 w-full' : 'pt-32 max-w-lg mx-auto'}`}
    >
      {!compact && (
        <>
          <h2 className="text-lg font-semibold text-foreground">Browse Repository</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enter a local directory path to explore its contents
          </p>
        </>
      )}
      <div className="flex w-full gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Local path — e.g. /Users/you/repo"
            className={`w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 ${url ? 'pr-8' : ''}`}
            disabled={isLoading}
          />
          {url && !isLoading && (
            <button
              onClick={() => setUrl('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !url.trim()}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
        >
          <Search size={16} />
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button
        variant="outline"
        onClick={handleBrowseLocal}
        disabled={isLoading}
        className="cursor-pointer"
      >
        <FolderOpen size={16} />
        Browse Local Repository
      </Button>
    </div>
  )
}
