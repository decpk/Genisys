import type { SettingsSection } from '../Settings.types'

/**
 * Maps each runtime app to the Settings section most relevant to it.
 * Used by `SettingsSidePanel` to auto-pick a section when the user
 * hasn't pinned one.
 *
 * Pure function — no side effects, safe to memoize.
 */
const APP_TO_SECTION: Record<string, SettingsSection> = {
  dashboard: 'dashboard',
  dailyplan: 'dailyPlan',
  explorer: 'explorer',
  chat: 'chat',
  library: 'library',
  notes: 'notes',
  clipboard: 'clipboard',
  timer: 'clock',
  apiclient: 'developer',
  mockserver: 'developer',
  autoflow: 'user',
  webpoint: 'user',
  promptmanager: 'aiAssistant',
  storeinspector: 'developer',
  aiinspector: 'developer',
  debug: 'developer',
  settings: 'user',
}

const DEFAULT_SECTION: SettingsSection = 'user'

export function getSectionForApp(activeApp: string): SettingsSection {
  return APP_TO_SECTION[activeApp] ?? DEFAULT_SECTION
}
