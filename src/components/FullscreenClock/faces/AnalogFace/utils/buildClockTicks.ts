export interface ClockTick {
  index: number
  isHour: boolean
  x1: number
  y1: number
  x2: number
  y2: number
}

const CX = 100
const CY = 100
const OUTER = 94

export function buildClockTicks(): ClockTick[] {
  const ticks: ClockTick[] = []
  for (let i = 0; i < 60; i++) {
    const isHour = i % 5 === 0
    const angle = (i * 6 * Math.PI) / 180
    const inner = isHour ? 84 : 90
    ticks.push({
      index: i,
      isHour,
      x1: CX + Math.sin(angle) * inner,
      y1: CY - Math.cos(angle) * inner,
      x2: CX + Math.sin(angle) * OUTER,
      y2: CY - Math.cos(angle) * OUTER,
    })
  }
  return ticks
}
