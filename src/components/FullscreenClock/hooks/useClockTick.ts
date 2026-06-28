import { useEffect, useState } from 'react'

export function useClockTick(active: boolean): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!active) return
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [active])

  return now
}
