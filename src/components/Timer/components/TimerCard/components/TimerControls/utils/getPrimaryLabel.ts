export function getPrimaryLabel(isRunning: boolean): string {
  if (isRunning) return 'Pause'
  return 'Start'
}
