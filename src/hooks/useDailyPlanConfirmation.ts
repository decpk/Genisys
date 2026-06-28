import { useState, useCallback } from 'react'

export interface DailyPlanConfirmationState {
  isOpen: boolean
  isLoading: boolean
  title: string
  description: string
  itemName: string
  warnings: string[]
  confirmCallback?: () => Promise<void> | void
}

const defaultState: DailyPlanConfirmationState = {
  isOpen: false,
  isLoading: false,
  title: '',
  description: '',
  itemName: '',
  warnings: [],
  confirmCallback: undefined,
}

export function useDailyPlanConfirmation() {
  const [confirmationState, setConfirmationState] = useState<DailyPlanConfirmationState>(defaultState)

  const openConfirmation = useCallback(
    (
      title: string,
      description: string,
      itemName: string,
      confirmCallback: () => Promise<void> | void,
      warnings: string[] = []
    ) => {
      setConfirmationState({
        isOpen: true,
        isLoading: false,
        title,
        description,
        itemName,
        warnings,
        confirmCallback,
      })
    },
    []
  )

  const closeConfirmation = useCallback(() => {
    setConfirmationState(defaultState)
  }, [])

  const handleConfirm = useCallback(async () => {
    setConfirmationState((prev) => ({ ...prev, isLoading: true }))
    try {
      if (confirmationState.confirmCallback) {
        await confirmationState.confirmCallback()
      }
      closeConfirmation()
    } catch (error) {
      console.error('Confirmation callback failed:', error)
      setConfirmationState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [confirmationState, closeConfirmation])

  const handleCancel = useCallback(() => {
    closeConfirmation()
  }, [closeConfirmation])

  return {
    isOpen: confirmationState.isOpen,
    isLoading: confirmationState.isLoading,
    title: confirmationState.title,
    description: confirmationState.description,
    itemName: confirmationState.itemName,
    warnings: confirmationState.warnings,
    openConfirmation,
    closeConfirmation,
    handleConfirm,
    handleCancel,
  }
}
