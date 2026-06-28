import type { AppData } from '@/store/app-data'

type Settings = AppData['settings']

/**
 * App-id renames applied one-time to persisted settings. Each key is a legacy
 * `AppView` id that has been renamed to its mapped value.
 */
const APP_ID_RENAMES: Record<string, string> = {
  previewer: 'weblinks',
}

function rename(id: string): string {
  return APP_ID_RENAMES[id] ?? id
}

/**
 * Rekey an app-id-keyed record in place: move each renamed legacy id's value
 * to its new id (without clobbering an existing new-id value), and drop the
 * stale legacy key. Returns whether anything changed.
 */
function rekeyRecord(record: Record<string, unknown> | undefined): boolean {
  if (!record) return false
  let changed = false
  for (const [oldId, newId] of Object.entries(APP_ID_RENAMES)) {
    if (!(oldId in record)) continue
    if (!(newId in record)) record[newId] = record[oldId]
    delete record[oldId]
    changed = true
  }
  return changed
}

/**
 * One-time, idempotent migration that rewrites renamed `AppView` ids in
 * persisted settings (currently `previewer` → `weblinks`). Mutates `settings`
 * in place and returns whether anything changed, so the caller can persist.
 *
 * Covers the fields that key off an app id: `lastActiveApp`, `enabledApps`,
 * the `appBackfillSeen` markers (so a renamed app keeps the user's
 * enabled/disabled choice rather than being re-injected), and the per-app AI
 * `appModes` / `panelConfigs` overrides (so a saved model/mode choice carries
 * over to the renamed app instead of resetting to defaults).
 */
export function migrateRenamedAppViews(settings: Settings): boolean {
  let changed = false

  const last = settings.lastActiveApp as string
  const renamedLast = rename(last)
  if (renamedLast !== last) {
    settings.lastActiveApp = renamedLast as Settings['lastActiveApp']
    changed = true
  }

  if (Array.isArray(settings.enabledApps)) {
    const before = settings.enabledApps as string[]
    const next = before.map(rename)
    if (next.some((id, i) => id !== before[i])) {
      settings.enabledApps = next as Settings['enabledApps']
      changed = true
    }
  }

  if (Array.isArray(settings.appBackfillSeen)) {
    const before = settings.appBackfillSeen
    const next = before.map(rename)
    if (next.some((id, i) => id !== before[i])) {
      settings.appBackfillSeen = next
      changed = true
    }
  }

  // Per-app AI overrides are records keyed by the app id.
  if (rekeyRecord(settings.aiAssistant?.appModes as Record<string, unknown>)) {
    changed = true
  }
  if (rekeyRecord(settings.aiAssistant?.panelConfigs as Record<string, unknown>)) {
    changed = true
  }

  return changed
}
