import { useEffect, useState } from 'react'

import { useFullscreenClockStore } from '@/store/fullscreen-clock-store'
import { useSettingsStore } from '@/store/settings-store'

import type { FullscreenClockFace } from '@/store/settings-store'
import type { TimeParts } from '../FullscreenClock.types'

import { useClockTick } from './useClockTick'
import { useAutoDismiss } from './useAutoDismiss'
import { useDismissKeys } from './useDismissKeys'
import { useMountTransition } from './useMountTransition'
import { getTimeParts } from '../utils/getTimeParts'
import { formatClockDate } from '../utils/formatClockDate'
import { computeLeaveBeforeMs } from '../utils/computeLeaveBeforeMs'

export interface FullscreenClockData {
  mounted: boolean
  visible: boolean
  isLeaving: boolean
  isHolding: boolean
  leaveBeforeMs: number
  hide: () => void
  parts: TimeParts
  now: Date
  dateLabel: string
  face: FullscreenClockFace
}

export function useFullscreenClockData(): FullscreenClockData {
  const isOpen = useFullscreenClockStore((s) => s.isOpen)
  const isHolding = useFullscreenClockStore((s) => s.isHolding)
  const hide = useFullscreenClockStore((s) => s.hide)
  const timeoutMs = useSettingsStore((s) => s.fullscreenClockTimeoutMs)
  const face = useSettingsStore((s) => s.fullscreenClockFace)

  const { mounted, visible } = useMountTransition(isOpen)
  const now = useClockTick(isOpen)
  const [isLeaving, setIsLeaving] = useState(false)
  // When the user opts into "infinite" (timeoutMs === 0), there's no auto-
  // dismiss and therefore no PiP "leave" window.
  const isInfinite = timeoutMs <= 0
  const leaveBeforeMs = isInfinite ? 0 : computeLeaveBeforeMs(timeoutMs)

  // While the user is holding the shortcut in press-and-hold mode, suppress
  // auto-dismiss (no PiP, no timeout) and the alternate dismiss keys so the
  // only way out is releasing the shortcut.
  //
  // When the timeout is set to ∞, we also suppress auto-dismiss — but keep
  // the dismiss keys (Escape / Enter / Space) active so the user can still
  // close the clock manually.
  const autoDismissActive = isOpen && !isHolding && !isInfinite
  const dismissKeysActive = isOpen && !isHolding

  useAutoDismiss(autoDismissActive, timeoutMs, hide, {
    leaveBeforeMs,
    onLeave: () => setIsLeaving(true),
    onReset: () => setIsLeaving(false),
  })
  useDismissKeys(dismissKeysActive, hide)

  // Reset leaving state when the modal is freshly OPENED so the next session
  // starts cleanly. We deliberately do NOT reset on close — keeping isLeaving
  // true during the unmount delay lets the card transform out from the PiP
  // corner instead of teleporting back to the centre before sliding away.
  useEffect(() => {
    if (isOpen) setIsLeaving(false)
  }, [isOpen])

  const parts = getTimeParts(now)
  const dateLabel = formatClockDate(now)

  return { mounted, visible, isLeaving, isHolding, leaveBeforeMs, hide, parts, now, dateLabel, face }
}
