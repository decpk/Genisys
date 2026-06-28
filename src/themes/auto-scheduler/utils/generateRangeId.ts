export function generateRangeId(): string {
  return `range-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
