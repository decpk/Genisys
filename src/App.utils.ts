export function isDebugPanelMode(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('mode') === 'debug'
}

export function getStandaloneAppParam(): string | null {
  const params = new URLSearchParams(window.location.search)
  if (params.get('mode') !== 'standalone') return null
  return params.get('app')
}

export function isTimerFocusMiniMode(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.get('mode') === 'focus-mini'
}
