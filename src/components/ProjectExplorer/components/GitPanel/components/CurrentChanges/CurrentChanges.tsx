import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { AppInlineLoader } from '@/components/AppLoader'
import { ErrorMessage } from '@/components/ui/error-message'
import { useGitStatus } from '../../hooks'
import { CollapsibleSection } from '../CollapsibleSection'
import { GitFileItem } from '../GitFileItem'
import {
  groupFilesByCategory,
  categorizeFile,
  categorizeByIndex,
  splitStagedUnstaged
} from '../../GitPanel.utils'
import type { CurrentChangesProps } from './CurrentChanges.types'

export function CurrentChanges({ rootPath }: CurrentChangesProps): React.JSX.Element {
  const { files, isLoading, error, fetch } = useGitStatus(rootPath)
  const hasFetched = useRef(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetch()
    }
  }, [fetch])

  const { staged, unstaged } = useMemo(() => splitStagedUnstaged(files), [files])
  const stagedGrouped = useMemo(() => groupFilesByCategory(staged), [staged])
  const unstagedGrouped = useMemo(() => groupFilesByCategory(unstaged), [unstaged])

  const toggleSection = (key: string): void => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (isLoading && files.length === 0) {
    return <AppInlineLoader size={16} className="py-4" message="Loading changes…" />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (files.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground text-center">
        No uncommitted changes
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/20">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {files.length} change{files.length !== 1 ? 's' : ''}
        </span>
        <Tooltip content="Refresh" side="left">
          <button
            onClick={fetch}
            disabled={isLoading}
            className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </Tooltip>
      </div>

      {staged.length > 0 && (
        <CollapsibleSection
          title="Staged Changes"
          count={staged.length}
          isOpen={openSections['staged'] !== false}
          onToggle={() => toggleSection('staged')}
        >
          {Array.from(stagedGrouped.entries()).map(([category, categoryFiles]) => (
            <div key={category}>
              {categoryFiles.map((file) => (
                <GitFileItem
                  key={`s-${file.path}`}
                  file={file}
                  category={categorizeByIndex(file)}
                />
              ))}
            </div>
          ))}
        </CollapsibleSection>
      )}

      {unstaged.length > 0 && (
        <CollapsibleSection
          title="Changes"
          count={unstaged.length}
          isOpen={openSections['unstaged'] !== false}
          onToggle={() => toggleSection('unstaged')}
        >
          {Array.from(unstagedGrouped.entries()).map(([category, categoryFiles]) => (
            <div key={category}>
              {categoryFiles.map((file) => (
                <GitFileItem key={`u-${file.path}`} file={file} category={categorizeFile(file)} />
              ))}
            </div>
          ))}
        </CollapsibleSection>
      )}
    </div>
  )
}
