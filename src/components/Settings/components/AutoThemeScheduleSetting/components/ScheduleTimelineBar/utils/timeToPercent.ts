export function timeToPercent(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return ((hours * 60 + minutes) / 1440) * 100
}
