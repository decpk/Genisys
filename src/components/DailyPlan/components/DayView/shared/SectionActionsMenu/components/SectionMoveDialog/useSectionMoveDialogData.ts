import { useEffect, useState } from 'react'

import { resolveTargetDate } from './utils/resolveTargetDate'
import type { SectionMoveDialogProps } from './SectionMoveDialog.types'

export function useSectionMoveDialogData(props: SectionMoveDialogProps) {
  const { open, mode, onConfirm } = props

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Reset the picked date whenever the dialog transitions to open.
  useEffect(() => {
    if (open) {
      setSelectedDate(undefined)
    }
  }, [open])

  const targetDate = resolveTargetDate(mode, selectedDate)
  const canConfirm = mode === 'tomorrow' || (mode === 'pick' && selectedDate !== undefined)

  function handleConfirm(): void {
    if (targetDate !== null) {
      onConfirm(targetDate)
    }
  }

  return {
    selectedDate,
    setSelectedDate,
    canConfirm,
    handleConfirm,
  }
}
