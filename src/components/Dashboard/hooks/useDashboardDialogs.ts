import { useCallback, useState } from 'react'

interface DashboardDialogs {
  /** LiveSportsDialog props (open state, onClose). */
  liveSports: {
    isOpen: boolean
    onClose: () => void
  }
  /** Open the LiveSportsDialog. */
  openLiveSportsDialog: () => void
}

/**
 * Owns dashboard-level dialog state (the Live Sports tracker dialog).
 */
export function useDashboardDialogs(): DashboardDialogs {
  const [isSportsOpen, setIsSportsOpen] = useState(false)

  const openLiveSportsDialog = useCallback(() => {
    setIsSportsOpen(true)
  }, [])

  const closeLiveSports = useCallback(() => {
    setIsSportsOpen(false)
  }, [])

  return {
    liveSports: {
      isOpen: isSportsOpen,
      onClose: closeLiveSports,
    },
    openLiveSportsDialog,
  }
}
