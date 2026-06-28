import type { AppData } from '@/store/app-data'

import { FIRST_LOAD_ENABLED_APPS, NEWLY_LAUNCHED_APPS } from '../AppView.constants'

type Settings = AppData['settings']

/**
 * One-time, idempotent reset that seeds the curated first-load app set
 * for EVERY user — brand-new installs and existing users alike — exactly
 * once.
 *
 * On the first settings load where `didResetToDefaultApps` is not yet
 * set, this:
 *  - replaces `enabledApps` with `FIRST_LOAD_ENABLED_APPS` (the curated
 *    minimal set), and
 *  - seeds `appBackfillSeen` with every `NEWLY_LAUNCHED_APPS` id so the
 *    backfill pass that runs right after does NOT re-add the apps we just
 *    disabled, and
 *  - marks `didResetToDefaultApps` so the reset never runs again.
 *
 * After the reset, the user's App Store enable/disable choices stick
 * across restarts. Mutates `settings` in place and returns whether
 * anything changed so the caller can persist.
 */
export function applyDefaultAppsReset(settings: Settings): boolean {
  if (settings.didResetToDefaultApps) return false

  settings.enabledApps = [...FIRST_LOAD_ENABLED_APPS]
  settings.appBackfillSeen = [...NEWLY_LAUNCHED_APPS]
  settings.didResetToDefaultApps = true
  return true
}
