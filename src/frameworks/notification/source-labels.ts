// ─── Notification Source → App Name Labels ───────────────────────────
//
// `notify({ source })` uses short slugs (e.g. 'api-client'). For display we
// surface a friendly, user-facing app name so people know which app a
// notification came from (iOS-style app attribution).

/** Friendly, user-facing display names for known notification sources. */
const SOURCE_LABELS: Record<string, string> = {
  chat: 'Chat',
  explorer: 'Explorer',
  'deep-research': 'Deep Research',
  'api-client': 'API Client',
  'daily-plan': 'Daily Plan',
  messages: 'Messages',
  'live-sports': 'Live Sports',
  stocks: 'Stocks',
  timer: 'Timer',
  library: 'Library',
  clipboard: 'Clipboard',
  settings: 'Settings',
  prompts: 'Prompts',
  'mock-server': 'Mock Server',
  tts: 'Text to Speech',
  voice: 'Voice Input',
  notes: 'Notes',
  dashboard: 'Dashboard',
  terminal: 'Terminal',
  debug: 'Debug',
  quickshare: 'QuickShare',
  contentshare: 'Share',
  system: 'Genisys',
}

/**
 * Resolve a human-friendly app name for a notification `source`.
 *
 * Known sources map to curated labels; unknown slugs fall back to
 * title-casing the slug (e.g. `'my-app' → 'My App'`).
 */
export function getSourceLabel(source: string): string {
  const known = SOURCE_LABELS[source]
  if (known) return known

  return source
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
