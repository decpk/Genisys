import type { AppView } from '../../settings-store'
import { INSTALLABLE_APP_VIEWS, NEWLY_LAUNCHED_APPS } from '../AppView.constants'

export interface AppBackfillResult {
  /** Possibly-extended `enabledApps` array (new ref only when mutated). */
  enabledApps: AppView[]
  /** Updated set of seen backfill ids (new ref only when mutated). */
  appBackfillSeen: string[]
  /** True when either `enabledApps` or `appBackfillSeen` was changed. */
  mutated: boolean
}

/**
 * Auto-inject any `NEWLY_LAUNCHED_APPS` into an existing user's
 * `enabledApps` array — but only once per app id. The "already seen"
 * state is persisted via `settings.appBackfillSeen`, so users who
 * explicitly disable the backfilled app via the App Store keep their
 * choice across restarts.
 *
 * Pure — returns new arrays only when something actually changed so the
 * caller can skip the persistence write on the steady-state path.
 */
export function applyAppBackfill(
  enabledApps: ReadonlyArray<AppView>,
  seen: ReadonlyArray<string> | undefined,
): AppBackfillResult {
  const seenSet = new Set(seen ?? [])
  const enabledSet = new Set(enabledApps)

  let nextEnabled: AppView[] | null = null
  let nextSeen: string[] | null = null

  for (const id of NEWLY_LAUNCHED_APPS) {
    if (seenSet.has(id)) continue
    // Belt + braces — never inject an id the App Store doesn't know about.
    if (!INSTALLABLE_APP_VIEWS.has(id)) continue

    if (!enabledSet.has(id)) {
      nextEnabled = nextEnabled ?? [...enabledApps]
      nextEnabled.push(id)
      enabledSet.add(id)
    }
    nextSeen = nextSeen ?? [...seenSet]
    nextSeen.push(id)
    seenSet.add(id)
  }

  if (!nextEnabled && !nextSeen) {
    return {
      enabledApps: enabledApps as AppView[],
      appBackfillSeen: (seen ?? []) as string[],
      mutated: false,
    }
  }

  return {
    enabledApps: nextEnabled ?? (enabledApps as AppView[]),
    appBackfillSeen: nextSeen ?? ((seen ?? []) as string[]),
    mutated: true,
  }
}
