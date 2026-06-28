import { useCallback, useState } from 'react'

import type { AppView } from '@/components/ActivityBar'

import type { UsePRNavigationReturn } from './usePRNavigation.types'

export function usePRNavigation(setActiveApp: (app: AppView) => void): UsePRNavigationReturn {
  const [openPRUrl, setOpenPRUrl] = useState<string | null>(null)

  const handleOpenHistoryPR = useCallback(
    (organization: string, pullRequestId: number, project: string): void => {
      setOpenPRUrl(`${organization}||${project}||${pullRequestId}`)
      setActiveApp('reviewer')
    },
    [setActiveApp]
  )

  return { openPRUrl, setOpenPRUrl, handleOpenHistoryPR }
}
