import { useTimerStore } from '@/store/timer-store'

import type { UseTimerSidebarDataReturn } from './TimerSidebar.types'

export function useTimerSidebarData(): UseTimerSidebarDataReturn {
  const instances = useTimerStore((s) => s.instances)
  const tags = useTimerStore((s) => s.tags)
  const primaryId = useTimerStore((s) => s.primaryId)
  const setPrimary = useTimerStore((s) => s.setPrimary)
  const removeInstance = useTimerStore((s) => s.removeInstance)
  const newTimerOpen = useTimerStore((s) => s.isNewTimerDialogOpen)
  const openNewTimerDialog = useTimerStore((s) => s.openNewTimerDialog)
  const closeNewTimerDialog = useTimerStore((s) => s.closeNewTimerDialog)

  const setNewTimerOpen = (open: boolean): void => {
    if (open) openNewTimerDialog()
    else closeNewTimerDialog()
  }

  return {
    instances,
    tags,
    primaryId,
    setPrimary,
    removeInstance,
    newTimerOpen,
    openNewTimerDialog,
    closeNewTimerDialog,
    setNewTimerOpen,
  }
}
