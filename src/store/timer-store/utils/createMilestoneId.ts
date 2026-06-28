export function createMilestoneId(): string {
  return `milestone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
