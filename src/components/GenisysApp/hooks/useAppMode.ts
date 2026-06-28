import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('system')

import type { AppView } from '@/components/ActivityBar'
import { findAppItem } from '@/components/ActivityBar'
import { setActiveAppId } from '@/components/GenisysApp/active-app-registry'
import { isAppBusy } from '@/components/GenisysApp/app-activity-registry'
import { computeAppsToEvict } from '@/components/GenisysApp/utils/computeAppsToEvict'
import { useAppSwitcherStore } from '@/frameworks/app-switcher'
import { useBindShortcutActions } from '@/frameworks/keyboard-shortcut'
import { useGlobalShortcutNavigation } from '@/hooks/useGlobalShortcutNavigation'
import { useKeyboardShortcutImpl } from '@/keyboard-shortcut-impl'
import { bindSetActiveApp } from '@/store/navigation-store'
import { useSettingsDrawerStore } from '@/store/settings-drawer-store'
import { useSettingsStore } from '@/store/settings-store'
import { usageTracker } from '@/lib/usage'

import type { UseAppModeReturn } from './useAppMode.types'

const TAB_ORDER: readonly AppView[] = [
  'dashboard',
  'dailyplan',
  'explorer',
  'autoflow',
  'webpoint',
  'chat',
  'library',
  'apiclient',
  'weblinks',
  'mockserver',
  'notes',
  'prompts',
  'messages',
  'clipboard',
  'timer',
  'terminal',
  'monitor',
  'quickshare',
  'appstore',
] as const

/**
 * AppViews whose mounted state is NOT controlled by `enabledApps` —
 * meta surfaces and developer-only inspectors. The App Store cannot
 * disable these.
 */
const ENABLEMENT_EXEMPT: ReadonlySet<AppView> = new Set([
  'settings',
  'debug',
  'storeinspector',
  'aiinspector',
])

/**
 * Apps that should NOT appear in the app-switcher HUD. These are either
 * meta surfaces (settings) or developer-only inspectors.
 */
const SWITCHER_EXCLUDED: ReadonlySet<AppView> = new Set([
  'settings',
  'debug',
  'storeinspector',
  'aiinspector',
])

function resolveInitialApp(last: AppView): AppView {
  if (last === 'settings' || last === 'debug' || last === 'storeinspector') return 'dashboard'
  // Validate against known views — stale values (e.g. removed 'research') fall back to dashboard
  if (!TAB_ORDER.includes(last)) return 'dashboard'
  return last
}

function resolveInitialAppWithEnablement(
  last: AppView,
  enabled: ReadonlyArray<AppView>,
): AppView {
  const resolved = resolveInitialApp(last)
  if (enabled.includes(resolved)) return resolved
  return 'dashboard'
}

export function useAppMode(): UseAppModeReturn {
  const setLastActiveApp = useSettingsStore((s) => s.setLastActiveApp)
  const enabledApps = useSettingsStore((s) => s.enabledApps)
  // Reactive subscription so restoration runs the moment settings finish loading.
  const isLoaded = useSettingsStore((s) => s.isLoaded)

  const activeAppRef = useRef<AppView>('dashboard')
  const activatedRef = useRef<Record<AppView, boolean>>({
    // Dashboard is the always-on fallback (see `deactivateApp`). Seeding it as
    // activated guarantees the main content area is never fully blank, even
    // before settings load / restoration runs.
    dashboard: true,
    dailyplan: false,
    explorer: false,
    autoflow: false,
    webpoint: false,
    chat: false,
    library: false,
    apiclient: false,
    weblinks: false,
    mockserver: false,
    notes: false,
    prompts: false,
    messages: false,
    clipboard: false,
    timer: false,
    terminal: false,
    monitor: false,
    quickshare: false,
    appstore: false,
    storeinspector: false,
    aiinspector: false,
    debug: false,
    settings: false,
  });
  const listenersRef = useRef(new Set<() => void>())
  const restoredRef = useRef(false)

  /**
   * Most-recently-used stack of app views. Index 0 is the current app,
   * index 1 is the previous app, etc. Used by the App Switcher HUD to
   * present candidates in Cmd+Tab–style MRU order. Session-only — not
   * persisted across launches.
   */
  const mruRef = useRef<AppView[]>(['dashboard'])

  const subscribe = useCallback((cb: () => void) => {
    listenersRef.current.add(cb)
    return () => { listenersRef.current.delete(cb) }
  }, [])

  const notify = useCallback(() => {
    for (const cb of listenersRef.current) cb()
  }, [])

  const getActiveApp = useCallback(() => activeAppRef.current, [])
  const getActivated = useCallback(() => activatedRef.current, [])

  const activeApp = useSyncExternalStore(subscribe, getActiveApp)
  const activated = useSyncExternalStore(subscribe, getActivated)

  // Restore the last active app once settings have loaded. Run in a layout
  // effect (before paint) and call `notify()` so the external-store snapshot is
  // re-read on the same commit — otherwise `useSyncExternalStore` keeps the
  // pre-restoration (dashboard-only) snapshot and the restored app's pane never
  // mounts, leaving the main area blank.
  useLayoutEffect(() => {
    if (!isLoaded || restoredRef.current) return
    restoredRef.current = true
    const { restoreLastApp, lastActiveApp } = useSettingsStore.getState()
    const app = restoreLastApp
      ? resolveInitialAppWithEnablement(lastActiveApp as AppView, enabledApps as ReadonlyArray<AppView>)
      : 'dashboard'
    activeAppRef.current = app
    activatedRef.current = { ...activatedRef.current, [app]: true }
    mruRef.current = [app]
    notify()
  }, [isLoaded, enabledApps, notify])

  const prevAppRef = useRef<AppView>(activeAppRef.current)

  /** Promote `app` to the front of the MRU stack (removing any prior entry). */
  const promoteInMRU = useCallback((app: AppView): void => {
    const filtered = mruRef.current.filter((a) => a !== app)
    mruRef.current = [app, ...filtered]
  }, [])

  /** Remove `app` from the MRU stack entirely (used on deactivate). */
  const dropFromMRU = useCallback((app: AppView): void => {
    mruRef.current = mruRef.current.filter((a) => a !== app)
  }, [])

  /**
   * Snapshot of switchable apps in MRU order. Filtered to apps that are
   * currently activated and not on the {@link SWITCHER_EXCLUDED} list.
   * Exposed for the App Switcher HUD.
   */
  const getAppMRU = useCallback((): AppView[] => {
    const activatedNow = activatedRef.current
    const { isAppEnabled } = useSettingsStore.getState()
    return mruRef.current.filter(
      (app) =>
        activatedNow[app] &&
        !SWITCHER_EXCLUDED.has(app) &&
        (ENABLEMENT_EXEMPT.has(app) || isAppEnabled(app)),
    )
  }, [])

  const setActiveApp = useCallback((app: AppView): void => {
    // Block navigation into a disabled app. Every entry point — Activity Bar,
    // Command Palette, switch-app shortcuts, the App Switcher HUD, dashboard
    // tiles, navigation-store deep links, the timer tray and AI entity links —
    // converges here, so gating once keeps a disabled app fully unreachable. Only
    // meta/dev surfaces (settings, inspectors) are exempt and always reachable.
    if (!ENABLEMENT_EXEMPT.has(app) && !useSettingsStore.getState().isAppEnabled(app)) {
      return
    }
    const prev = activeAppRef.current
    if (prev !== 'settings') {
      prevAppRef.current = prev
    }
    activeAppRef.current = app
    activatedRef.current = {
      ...activatedRef.current,
      [app]: true,
      // Unmount settings when navigating away to free memory
      ...(prev === 'settings' && app !== 'settings' ? { settings: false } : {}),
    }
    promoteInMRU(app)
    // Settings unmounts on navigation away, so drop it from MRU too.
    if (prev === 'settings' && app !== 'settings') {
      dropFromMRU('settings')
    }

    // ── Keep-alive LRU eviction ─────────────────────────────────────────
    // Cap the number of simultaneously-mounted apps so switching and
    // interaction stay snappy. Never evict the active app, the dashboard
    // fallback, meta/dev surfaces, or any app currently running a task
    // (reported via the app-activity registry). Busy apps temporarily exceed
    // the cap and are cleaned up on a later switch once they go idle.
    const keepAliveLimit = useSettingsStore.getState().keepAliveLimit
    const activatedNow = activatedRef.current
    const activatedList = (Object.keys(activatedNow) as AppView[]).filter(
      (a) => activatedNow[a],
    )
    const toEvict = computeAppsToEvict({
      activatedApps: activatedList,
      mru: mruRef.current,
      limit: keepAliveLimit,
      isExempt: (a) => ENABLEMENT_EXEMPT.has(a),
      isProtected: (a) => a === app || a === 'dashboard' || isAppBusy(a),
    })
    if (toEvict.length > 0) {
      const nextActivated: Record<AppView, boolean> = { ...activatedNow }
      for (const evicted of toEvict) {
        nextActivated[evicted] = false
        usageTracker.onAppDeactivated(evicted)
      }
      activatedRef.current = nextActivated
      mruRef.current = mruRef.current.filter((a) => !toEvict.includes(a))
    }

    setLastActiveApp(app)
    notify()

    if (prev !== app) {
      usageTracker.onAppActivated(app)
      usageTracker.onAppFocused(app)
    }

    if (app === 'clipboard') {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('clipboard:focus-search'))
      })
    }
  }, [setLastActiveApp, notify, promoteInMRU, dropFromMRU])

  const deactivateApp = useCallback((app: AppView): void => {
    // Dashboard is always-on fallback — cannot be deactivated
    if (app === 'dashboard') return

    const currentActive = activeAppRef.current
    const currentActivated = activatedRef.current

    // Not activated — nothing to do
    if (!currentActivated[app]) return

    // If deactivating the currently active app, switch to another first
    if (currentActive === app) {
      const nextApp = TAB_ORDER.find((a) => a !== app && currentActivated[a]) ?? 'dashboard'
      activeAppRef.current = nextApp
      activatedRef.current = {
        ...currentActivated,
        [nextApp]: true,
        [app]: false,
      }
      dropFromMRU(app)
      promoteInMRU(nextApp)
      setLastActiveApp(nextApp)
    } else {
      activatedRef.current = {
        ...currentActivated,
        [app]: false,
      }
      dropFromMRU(app)
    }
    usageTracker.onAppDeactivated(app)
    notify()
  }, [setLastActiveApp, notify, promoteInMRU, dropFromMRU])

  /**
   * Close (deactivate) every open app at once and return to the Dashboard.
   * Dashboard is the always-on fallback and is never closed. Developer-only
   * meta surfaces (settings/inspectors) are also left untouched.
   *
   * @returns the list of apps that were actually closed.
   */
  const closeAllApps = useCallback((): AppView[] => {
    const currentActivated = activatedRef.current
    const next: Record<AppView, boolean> = { ...currentActivated }
    const closed: AppView[] = []
    for (const key of Object.keys(currentActivated) as AppView[]) {
      if (key === 'dashboard' || ENABLEMENT_EXEMPT.has(key)) continue
      if (currentActivated[key]) {
        next[key] = false
        closed.push(key)
      }
    }
    if (closed.length === 0) return []
    for (const key of closed) {
      usageTracker.onAppDeactivated(key)
    }
    next.dashboard = true
    activatedRef.current = next
    activeAppRef.current = 'dashboard'
    mruRef.current = ['dashboard']
    setLastActiveApp('dashboard')
    notify()
    return closed
  }, [setLastActiveApp, notify])

  bindSetActiveApp(setActiveApp)

  useBindShortcutActions({
    'global.switchApp.dashboard': () => setActiveApp('dashboard'),
    'global.switchApp.dailyplan': () => setActiveApp('dailyplan'),
    'global.switchApp.notes': () => setActiveApp('notes'),
    'global.switchApp.prompts': () => setActiveApp('prompts'),
    'global.switchApp.library': () => setActiveApp('library'),
    'global.switchApp.explorer': () => setActiveApp('explorer'),
    'global.switchApp.chat': () => setActiveApp('chat'),
    'global.switchApp.messages': () => setActiveApp('messages'),
    'global.switchApp.apiclient': () => setActiveApp('apiclient'),
    'global.switchApp.weblinks': () => setActiveApp('weblinks'),
    'global.switchApp.mockserver': () => setActiveApp('mockserver'),
    'global.switchApp.autoflow': () => setActiveApp('autoflow'),
    'global.switchApp.webpoint': () => setActiveApp('webpoint'),
    'global.switchApp.clipboard': () => setActiveApp('clipboard'),
    'global.switchApp.timer': () => setActiveApp('timer'),
    'global.switchApp.terminal': () => setActiveApp('terminal'),
    'global.switchApp.appstore': () => setActiveApp('appstore'),
    'global.settings.toggleDrawer': () => {
      useSettingsDrawerStore.getState().toggle()
    },
    'global.settings.openFullApp': () => {
      const current = activeAppRef.current
      setActiveApp(current === 'settings' ? prevAppRef.current : 'settings')
    },
    'global.appSwitcher.next': () => {
      useAppSwitcherStore.getState().openOrAdvance(1, getAppMRU())
    },
    'global.appSwitcher.prev': () => {
      useAppSwitcherStore.getState().openOrAdvance(-1, getAppMRU())
    },
    'global.appSwitcher.closeAll': () => {
      useAppSwitcherStore.getState().close()
      const closed = closeAllApps()
      if (closed.length === 0) {
        toast.info('No open apps to close')
        return
      }
      const names = closed.map((app) => findAppItem(app)?.label ?? app)
      toast.success(
        `Closed ${closed.length} app${closed.length === 1 ? '' : 's'}`,
        { description: names.join(', ') },
      )
    },
  })

  useKeyboardShortcutImpl()

  // When the App Store toggles `enabledApps`, ensure any disabled app that
  // is currently active or mounted is reset — we redirect the active app
  // to dashboard and unmount disabled apps so they can't keep running.
  useEffect(() => {
    const enabledSet = new Set(enabledApps)
    const currentActivated = activatedRef.current
    let changed = false
    const next: Record<AppView, boolean> = { ...currentActivated }
    for (const key of Object.keys(currentActivated) as AppView[]) {
      if (ENABLEMENT_EXEMPT.has(key)) continue
      if (currentActivated[key] && !enabledSet.has(key)) {
        next[key] = false
        changed = true
        mruRef.current = mruRef.current.filter((a) => a !== key)
      }
    }
    const activeNow = activeAppRef.current
    if (!ENABLEMENT_EXEMPT.has(activeNow) && !enabledSet.has(activeNow)) {
      activeAppRef.current = 'dashboard'
      next.dashboard = true
      mruRef.current = ['dashboard', ...mruRef.current.filter((a) => a !== 'dashboard')]
      setLastActiveApp('dashboard')
      changed = true
    }
    if (changed) {
      activatedRef.current = next
      notify()
    }
  }, [enabledApps, notify, setLastActiveApp])

  const navigateToClipboard = useCallback(() => setActiveApp('clipboard'), [setActiveApp])
  useGlobalShortcutNavigation(navigateToClipboard)

  // Mirror the active app into the global active-app registry so background
  // tickers/pollers can cheaply gate their work by visibility (see
  // `useIsAppActive`). One effect covers every path that changes the active app.
  useEffect(() => {
    setActiveAppId(activeApp)
  }, [activeApp])

  return { activeApp, setActiveApp, activated, deactivateApp }
}
