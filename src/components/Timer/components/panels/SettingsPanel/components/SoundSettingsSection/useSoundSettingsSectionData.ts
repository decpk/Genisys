import { useCallback, useEffect, useRef, useState } from 'react'

import { playTimerSound } from '@/components/Timer/utils/playTimerSound'

import { getSoundProfileDurationMs } from './utils/getSoundProfileDurationMs'

import type { UseSoundSettingsSectionDataResult } from './useSoundSettingsSectionData.types'

/**
 * Owns the "currently previewing" state for the sound section. Only one preview
 * can be active at a time — clicking play on a new row immediately replaces the
 * indicator state and resets the auto-clear timer to that sound's profile
 * duration.
 */
export function useSoundSettingsSectionData(): UseSoundSettingsSectionDataResult {
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const previewSound = useCallback(
    (soundId: string) => {
      clearPendingTimeout()
      if (soundId === 'none') {
        setPreviewingId(null)
        return
      }
      playTimerSound(soundId, 'work-end')
      setPreviewingId(soundId)
      const durationMs = getSoundProfileDurationMs(soundId)
      timeoutRef.current = window.setTimeout(() => {
        setPreviewingId(null)
        timeoutRef.current = null
      }, durationMs)
    },
    [clearPendingTimeout],
  )

  useEffect(() => {
    return () => {
      clearPendingTimeout()
    }
  }, [clearPendingTimeout])

  return { previewingId, previewSound }
}
