import { create } from 'zustand'

interface SecurityLockState {
  isLocked: boolean
  failedAttempts: number
  lockoutUntil: number | null
}

interface SecurityLockActions {
  lock: () => void
  unlock: (verified: boolean) => void
  incrementFailedAttempts: (maxAttempts: number) => void
  resetFailedAttempts: () => void
}

export const useSecurityLockStore = create<SecurityLockState & SecurityLockActions>()(
  (set, get) => ({
    isLocked: false,
    failedAttempts: 0,
    lockoutUntil: null,

    lock: () => {
      set({ isLocked: true })
    },

    unlock: (verified) => {
      if (!verified) return
      set({ isLocked: false, failedAttempts: 0, lockoutUntil: null })
    },

    incrementFailedAttempts: (maxAttempts) => {
      const next = get().failedAttempts + 1
      const lockoutUntil =
        next >= maxAttempts ? Date.now() + 30_000 : null // 30s lockout
      set({ failedAttempts: next, lockoutUntil })
    },

    resetFailedAttempts: () => {
      set({ failedAttempts: 0, lockoutUntil: null })
    },
  })
)
