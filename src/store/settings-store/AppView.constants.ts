import type { AppView } from '../settings-store'

/**
 * Apps that are always required and cannot be removed from
 * `enabledApps`. They are auto-injected on every normalization pass.
 *
 * - `dashboard` is the always-on home / fallback when an active app gets
 *   disabled or removed.
 * - `appstore` is how the user re-enables anything they've disabled, so
 *   it must stay reachable from the ActivityBar at all times.
 * - `quickshare` is the always-available share hub, so it stays pinned in
 *   the ActivityBar at all times.
 */
export const ALWAYS_ENABLED_APPS: ReadonlyArray<AppView> = [
  'dashboard',
  'appstore',
  'quickshare',
]

/**
 * The set of apps enabled on a brand-new install AND applied once to
 * existing users via the one-time default-apps reset (see
 * `applyDefaultAppsReset`). This now lists EVERY installable app, so all
 * app icons show in the ActivityBar by default on first launch — users can
 * still hide any of them afterwards via the App Store / drag-to-disable.
 *
 * Listed in the canonical ActivityBar order (see `APP_ITEMS`) so the bar
 * renders in a sensible sequence before any manual reordering. `dashboard`,
 * `appstore` + `quickshare` are also in `ALWAYS_ENABLED_APPS` (locked on),
 * but are listed here so the default `enabledApps` array is self-contained.
 *
 * Keep this in sync with `INSTALLABLE_APP_VIEWS` below.
 */
export const FIRST_LOAD_ENABLED_APPS = [
  'dashboard',
  'dailyplan',
  'timer',
  'notes',
  'library',
  'explorer',
  'prompts',
  'chat',
  'messages',
  'apiclient',
  'weblinks',
  'mockserver',
  'clipboard',
  'terminal',
  'monitor',
  'quickshare',
  'autoflow',
  'webpoint',
  'appstore',
] as const

/**
 * Set of every `AppView` that is a real "installable" app — i.e. anything
 * the App Store can show + toggle. Excludes settings/debug surfaces and
 * legacy modes that were removed but may still appear in stale persisted
 * state.
 */
export const INSTALLABLE_APP_VIEWS: ReadonlySet<AppView> = new Set<AppView>([
  'dashboard',
  'dailyplan',
  'explorer',
  'autoflow',
  'webpoint',
  'chat',
  'messages',
  'terminal',
  'monitor',
  'quickshare',
  'library',
  'apiclient',
  'weblinks',
  'mockserver',
  'notes',
  'prompts',
  'clipboard',
  'timer',
  'appstore',
])

/**
 * Apps that were added AFTER the App Store shipped and should be auto-
 * injected into existing users' `enabledApps` arrays the first time
 * their settings load — so the app's icon "just shows up" in the
 * ActivityBar without the user having to discover it in the App Store.
 *
 * The injection is one-shot per app id, tracked by
 * `settings.appBackfillSeen` (see `applyAppBackfill`). Users can still
 * disable a backfilled app via the App Store and the choice will stick.
 *
 * Remove an id from this list once the app is no longer "new" (every
 * existing user will have been backfilled by then).
 */
export const NEWLY_LAUNCHED_APPS: ReadonlyArray<AppView> = [
  'dailyplan',
  'timer',
  'notes',
  'library',
  'explorer',
  'prompts',
  'chat',
  'messages',
  'apiclient',
  'weblinks',
  'mockserver',
  'clipboard',
  'terminal',
  'monitor',
  'quickshare',
  'autoflow',
  'webpoint',
]
