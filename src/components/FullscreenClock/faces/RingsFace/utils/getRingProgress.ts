interface RingProgress {
  hourPct: number
  minutePct: number
  secondPct: number
}

export function getRingProgress(now: Date): RingProgress {
  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds() + now.getMilliseconds() / 1000
  return {
    hourPct: (h + m / 60) / 12,
    minutePct: (m + s / 60) / 60,
    secondPct: s / 60,
  }
}
