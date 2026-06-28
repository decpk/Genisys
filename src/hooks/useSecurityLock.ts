import { useEffect, useCallback, useRef } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useSecurityLockStore } from '@/store/security-lock-store'
import { useWindowFocus } from './useWindowFocus'
import { verifyPassword } from '@/lib/crypto'

export function useSecurityLock(): {
  isLocked: boolean
  attemptUnlock: (input: string) => Promise<boolean>
} {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const lockTimeoutMinutes = useSettingsStore((s) => s.securityLockTimeoutMinutes)
  const lockOnFocusLoss = useSettingsStore((s) => s.securityLockOnFocusLoss)
  const lockOnLaunch = useSettingsStore((s) => s.securityLockOnLaunch)
  const securityHash = useSettingsStore((s) => s.securityHash)
  const securitySalt = useSettingsStore((s) => s.securitySalt)
  const maxFailedAttempts = useSettingsStore((s) => s.securityMaxFailedAttempts)
  const isLoaded = useSettingsStore((s) => s.isLoaded)

  const isLocked = useSecurityLockStore((s) => s.isLocked)
  const lock = useSecurityLockStore((s) => s.lock)
  const unlock = useSecurityLockStore((s) => s.unlock)
  const incrementFailedAttempts = useSecurityLockStore((s) => s.incrementFailedAttempts)

  const focused = useWindowFocus()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevFocusedRef = useRef(true)
  const hasLockedOnLaunch = useRef(false)

  // ── Lock on app launch ──
  useEffect(() => {
    if (!isLoaded || hasLockedOnLaunch.current) return
    hasLockedOnLaunch.current = true
    if (securityEnabled && lockOnLaunch && securityHash) {
      lock()
    }
  }, [isLoaded, securityEnabled, lockOnLaunch, securityHash, lock])

  // ── Idle timer ──
  useEffect(() => {
    if (!securityEnabled || lockTimeoutMinutes <= 0 || isLocked || !securityHash) return

    const timeoutMs = lockTimeoutMinutes * 60_000

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => lock(), timeoutMs)
    }

    resetTimer()

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'] as const
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((e) => document.removeEventListener(e, resetTimer))
    }
  }, [securityEnabled, lockTimeoutMinutes, isLocked, lock, securityHash])

  // ── Lock on focus loss ──
  useEffect(() => {
    if (!securityEnabled || !lockOnFocusLoss || !securityHash) return

    // Lock when window loses focus (transition from focused → unfocused)
    if (prevFocusedRef.current && !focused) {
      lock()
    }
    prevFocusedRef.current = focused
  }, [focused, securityEnabled, lockOnFocusLoss, lock, securityHash])

  // ── Attempt unlock ──
  const attemptUnlock = useCallback(
    async (input: string): Promise<boolean> => {
      if (!securityHash || !securitySalt) return false

      const lockoutUntil = useSecurityLockStore.getState().lockoutUntil
      if (lockoutUntil && Date.now() < lockoutUntil) return false

      const verified = await verifyPassword(input, securityHash, securitySalt)
      if (verified) {
        unlock(true)
        return true
      }

      incrementFailedAttempts(maxFailedAttempts)
      return false
    },
    [securityHash, securitySalt, unlock, incrementFailedAttempts, maxFailedAttempts]
  )

  return { isLocked: securityEnabled && isLocked, attemptUnlock }
}
