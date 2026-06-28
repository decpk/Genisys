export function createTimerInstanceId(): string {
  return `timer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
