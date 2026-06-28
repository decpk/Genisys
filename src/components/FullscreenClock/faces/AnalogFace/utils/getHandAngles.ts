interface HandAngles {
  hour: number
  minute: number
  second: number
}

export function getHandAngles(now: Date): HandAngles {
  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds() + now.getMilliseconds() / 1000
  return {
    hour: (h + m / 60) * 30,
    minute: (m + s / 60) * 6,
    second: s * 6,
  }
}
