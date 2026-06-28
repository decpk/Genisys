import { create } from 'zustand'

interface FullscreenClockState {
  isOpen: boolean
  isHolding: boolean
  show: () => void
  hide: () => void
  toggle: () => void
  setHolding: (v: boolean) => void
}

export const useFullscreenClockStore = create<FullscreenClockState>((set, get) => ({
  isOpen: false,
  isHolding: false,
  show: () => {
    if (!get().isOpen) set({ isOpen: true })
  },
  hide: () => {
    const { isOpen, isHolding } = get()
    if (isOpen || isHolding) set({ isOpen: false, isHolding: false })
  },
  toggle: () => set({ isOpen: !get().isOpen, isHolding: false }),
  setHolding: (v) => {
    if (get().isHolding !== v) set({ isHolding: v })
  },
}))
