import { create } from 'zustand'

import type { ConfirmDialogStore } from './confirm-dialog-store.types'
import { defaultConfirmDialogState } from './utils/defaultConfirmDialogState'

export const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
  ...defaultConfirmDialogState,

  openConfirmDialog: (options) => {
    set({
      isOpen: true,
      isLoading: false,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? 'Delete',
      cancelLabel: options.cancelLabel ?? 'Cancel',
      variant: options.variant ?? 'destructive',
      onConfirm: options.onConfirm,
      secondaryActionLabel: options.secondaryActionLabel ?? null,
      onSecondaryAction: options.onSecondaryAction ?? null,
    })
  },

  closeConfirmDialog: () => {
    set(defaultConfirmDialogState)
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },
}))
