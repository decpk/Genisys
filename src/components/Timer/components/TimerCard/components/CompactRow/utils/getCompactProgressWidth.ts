export function getCompactProgressWidth(progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress))
  return `${clamped * 100}%`
}
