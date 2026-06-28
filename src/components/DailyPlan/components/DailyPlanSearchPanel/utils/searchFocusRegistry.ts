let focusCallback: (() => void) | null = null

export function registerSearchFocusCallback(cb: (() => void) | null): void {
  focusCallback = cb
}

export function activateDailyPlanSearch(): void {
  focusCallback?.()
}
