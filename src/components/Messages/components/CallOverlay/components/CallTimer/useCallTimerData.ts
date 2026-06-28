import { useEffect, useReducer } from 'react'

import type { CallTimerData } from './CallTimer.types'

function formatElapsed(startedAt: number | null): string {
  if (startedAt === null) return '00:00'
  const totalSeconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return `${mm}:${ss}`
}

export function useCallTimerData(startedAt: number | null): CallTimerData {
  const [, tick] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const label = formatElapsed(startedAt)

  return { label }
}
