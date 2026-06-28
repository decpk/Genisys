export interface KeepAwakeState {
  /** Whether the keep-awake guard is currently active. */
  isActive: boolean
  /** Whether the initial backend status read has completed. */
  isHydrated: boolean
  /** Whether a start/stop request is in-flight. */
  isBusy: boolean
  /** Last error message from a failed start/stop (e.g. missing permission). */
  error: string | null
  /** macOS Accessibility trust state for the presence nudge. */
  permission: 'unknown' | 'granted' | 'denied'
  /** Armed to auto-enable once Accessibility is granted (focus-driven). */
  pendingEnable: boolean
  /** Whether "keep awake when the lid is closed" is currently applied. */
  lidClose: boolean
  /** Whether a lid-close request is in-flight. */
  isLidBusy: boolean
  /** Last lid-close error (e.g. admin declined / unsupported platform). */
  lidError: string | null
}

export interface KeepAwakeActions {
  /** Read the current backend status and mark the store hydrated. */
  hydrate: () => Promise<void>
  /** Turn keep-awake on. Sets `error` on failure. */
  enable: () => Promise<void>
  /** Turn keep-awake off. */
  disable: () => Promise<void>
  /** Flip between enabled/disabled based on current `isActive`. */
  toggle: () => Promise<void>
  /** Re-check Accessibility and, if newly granted while armed, auto-enable. */
  recheckPermission: () => Promise<void>
  /** Toggle "keep awake when the lid is closed". */
  setLidClose: (enabled: boolean) => Promise<void>
}

export type KeepAwakeStore = KeepAwakeState & KeepAwakeActions
