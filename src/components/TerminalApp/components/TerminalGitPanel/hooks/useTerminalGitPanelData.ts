import { useCallback, useEffect, useMemo, useState } from 'react'

import { useTerminalGitDiffStore } from '@/store/terminal-git-diff-store'
import { useTerminalGitPanelStore } from '@/store/terminal-git-panel-store'
import { splitStagedUnstaged } from '@/components/ProjectExplorer/components/GitPanel/GitPanel.utils'
import type { GitStatusFile } from '@/components/ProjectExplorer/components/GitPanel/GitPanel.types'

import type { TerminalGitPanelData } from '../TerminalGitPanel.types'
import { folderName } from '../utils/folderName'
import { useTerminalGitStatus } from './useTerminalGitStatus'

/** Orchestrator hook: composes status + resize state with the panel's actions. */
export function useTerminalGitPanelData(
  leafId: string,
  cwd: string | null,
): TerminalGitPanelData {
  const status = useTerminalGitStatus()
  const refresh = status.refresh
  const openDiff = useTerminalGitDiffStore((s) => s.openDiff)
  const hide = useTerminalGitPanelStore((s) => s.hide)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const onChange = useCallback(() => {
    if (cwd) refresh(cwd)
  }, [cwd, refresh])

  // Fetch once when the folder changes (or the panel first mounts) so it shows
  // the current folder's changes. There is NO ongoing auto-refresh — the user
  // refreshes on demand via the refresh button. `refresh` is owned by
  // `useTerminalGitStatus` (a separate hook), so calling it here does not trip
  // react-hooks/set-state-in-effect.
  useEffect(() => {
    if (cwd) refresh(cwd)
  }, [cwd, refresh])

  const { staged, unstaged } = useMemo(
    () => splitStagedUnstaged(status.files),
    [status.files],
  )

  function toggleSection(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function onFileClick(file: GitStatusFile) {
    if (!status.gitRoot) return
    openDiff({ leafId, gitRoot: status.gitRoot, file: file.path, side: 'head' })
  }

  return {
    title: folderName(cwd),
    count: status.files.length,
    cwd,
    isRepo: status.isRepo,
    isLoading: status.isLoading,
    error: status.error,
    files: status.files,
    staged,
    unstaged,
    collapsed,
    toggleSection,
    onFileClick,
    onRefresh: onChange,
    onClose: () => hide(leafId),
  }
}
