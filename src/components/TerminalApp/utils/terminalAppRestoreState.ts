// Module-level restore flags, intentionally outside React state so they survive
// StrictMode's mount/unmount/mount cycle and gate the auto-create + persistence
// hooks. Mirrors the Code app's `codeRestoreState` pattern.

let restoreStarted = false
let restoreComplete = false

export function hasTerminalRestoreStarted(): boolean {
  return restoreStarted
}

export function markTerminalRestoreStarted(): void {
  restoreStarted = true
}

export function isTerminalRestoreComplete(): boolean {
  return restoreComplete
}

export function markTerminalRestoreComplete(): void {
  restoreComplete = true
}
