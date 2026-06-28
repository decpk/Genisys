import { LazyStore } from '@tauri-apps/plugin-store'
import { FIRST_LOAD_ENABLED_APPS } from './settings-store/AppView.constants'
import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'
import type { DndScheduleRange } from '@/frameworks/notification/dnd'
import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import type { PanelAIConfig } from './panel-ai-config.types'
import {
  EXPLORER_SHORTCUT_VISIBILITY_DEFAULTS,
  type ExplorerShortcutVisibility,
} from "./explorer-shortcut-keys";

// ── Shape ────────────────────────────────────────────────────────────

/**
 * Width a dashboard tile can occupy. `fill` stretches to the remaining columns
 * on its row (see `resolveTileColSpans`). Every tile's resize menu offers all
 * of these values, so each persisted width field must accept the full union.
 */
export type TileWidthSetting = "full" | "half" | "third" | "small" | "fill";

export interface AppData {
  settings: {
    user: {
      email: string;
    };
    dashboard: {
      lazyLoadTabs: boolean;
      snippetsTileWidth: TileWidthSetting;
      liveSportsTileWidth: TileWidthSetting;
      newsTileWidth: TileWidthSetting;
      stocksTileWidth: TileWidthSetting;
      todaysAgendaTileWidth: TileWidthSetting;
      currentlyReadingTileWidth: TileWidthSetting;
      clipboardQuickAccessTileWidth: TileWidthSetting;
      quickPromptsTileWidth: TileWidthSetting;
      timerTileWidth: TileWidthSetting;
      keepAwakeTileWidth: TileWidthSetting;
      timeCalendarTileWidth: TileWidthSetting;
      emailsAttentionTileWidth: TileWidthSetting;
      dashboardClockUse24Hour: boolean;
      tileOrder: string[];
      tileVisibility: Record<string, boolean>;
    };
    explorer: {
      defaultView: "list" | "grid" | "detailed" | "compact" | "thumbnail";
      sortField: "name" | "extension" | "path";
      sortDirection: "asc" | "desc";
      showHidden: boolean;
      hideFolders: boolean;
      mixFoldersWithFiles: boolean;
      dimHiddenFiles: boolean;
      singleClickOpen: boolean;
      shortcutVisibility: ExplorerShortcutVisibility;
    };
    layout: {
      activityBarPosition: "left" | "right" | "top" | "bottom";
      sidebarPosition: "left" | "right";
      showActivityBarLabels: boolean;
      globalFont:
        | "system"
        | "serif"
        | "mono"
        | "literata"
        | "lora"
        | "source-serif"
        | "inter"
        | "newsreader"
        | "crimson-pro"
        | "ia-writer-quattro"
        | "geist"
        | "geist-mono"
        | "poppins"
        | "segoe-ui"
        | "cascadia-code"
        | "ubuntu-sans"
        | "fira-sans";
      fontSize: number;
    };
    editor: {
      fontSize: number;
    };
    chat: {
      systemPrompt: string;
      model: string;
      /** True once the user explicitly picks a default model; gates startup best-model resolution. */
      modelUserSet?: boolean;
      widthPercent: number;
    };
    library: {
      readingFont:
        | "system"
        | "serif"
        | "mono"
        | "literata"
        | "lora"
        | "source-serif"
        | "inter"
        | "newsreader"
        | "crimson-pro"
        | "ia-writer-quattro";
      contentWidth: "narrow" | "medium" | "wide" | "full";
      inlineImageSize: "small" | "medium" | "large" | "full";
      defaultBookmarkView: "grouped" | "flat" | "recent";
      dfHideSidebar: boolean;
      dfHideRightPanel: boolean;
      dfHideActivityBar: boolean;
      dfHideHeader: boolean;
      dfHideBottomNav: boolean;
      dfShowHeaderOnHover: boolean;
      /**
       * When true (default), AI-generated chapter images are downloaded and
       * stored under the app data dir so they can be viewed offline. When
       * false, chapters keep their original remote image URLs and the cache
       * is never populated.
       */
      cacheImagesForOffline: boolean;
      /**
       * Default language used to seed the New Book / New Chapter generation
       * dialog. Users can still override per-book in the dialog itself.
       */
      defaultLanguage:
        | "english"
        | "hindi"
        | "hinglish"
        | "spanish"
        | "french"
        | "german"
        | "japanese"
        | "chinese"
        | "korean"
        | "arabic"
        | "portuguese"
        | "russian"
        | "italian"
        | "dutch"
        | "turkish"
        | "bengali";
    };
    notes: {
      contentWidth: "narrow" | "medium" | "wide" | "full";
      showLabels: boolean;
      mode: "view" | "edit";
      autoScrollEnabled: boolean;
      autoScrollSpeed: number;
      autoScrollMode?: "continuous" | "stepped";
      autoScrollStepPixels?: number;
      autoScrollStepIntervalMs?: number;
    };
    messages?: {
      contentWidth: "narrow" | "medium" | "wide" | "full-inset" | "full";
    };
    general: {
      explainLanguage:
        | "english"
        | "hindi"
        | "hinglish"
        | "spanish"
        | "french"
        | "german"
        | "japanese"
        | "chinese"
        | "korean"
        | "arabic"
        | "portuguese"
        | "russian"
        | "italian"
        | "dutch"
        | "turkish"
        | "bengali";
      recordNotifications: boolean;
      /** Show the percentage label while scrolling in Notes and Library. */
      showScrollPercentage: boolean;
      /** Show the thin scroll progress bar in Notes and Library. */
      showScrollProgressBar: boolean;
    };
    security: {
      enabled: boolean;
      type: "pin" | "password";
      hash: string;
      salt: string;
      lockTimeoutMinutes: number;
      lockOnFocusLoss: boolean;
      lockOnLaunch: boolean;
      maxFailedAttempts: number;
      preventScreenCapture: boolean;
    };
    telemetry: {
      /** User has turned anonymous usage analytics on. */
      enabled: boolean;
      /** The first-run consent prompt has been answered (opt-in or opt-out). */
      consentDecided: boolean;
      /** Stable anonymous device identifier (GUID), generated once. */
      anonymousId: string;
      /** ISO timestamp of the last consent decision. */
      consentedAt: string | null;
    };
    dailyPlan: {
      workStartTime: string | null;
      workEndTime: string | null;
      lunchStartTime: string | null;
      lunchEndTime: string | null;
      statusTemplate: string | null;
    };
    apiClient: {
      sortField: "name" | "method" | "createdAt" | "updatedAt";
      sortDirection: "asc" | "desc";
    };
    terminal?: {
      fontFamily: string | null;
      fontSize: number;
      lineHeight: number;
      letterSpacing: number;
      fontWeight: "normal" | "medium" | "bold";
      fontLigatures: boolean;
      insertPromptAutoRun?: boolean;
      historyAutocomplete?: boolean;
      gitPanelWidth?: number;
      defaultThemeId?: string | null;
    };
    keyboard: {
      overrides: Record<string, string>;
      disabled: string[];
    };
    clipboard?: {
      autoDescribeImages: boolean;
      maxItems: number;
      addOnce: boolean;
      syntaxHighlightCode: boolean;
      timelineSortDirection?: "desc" | "asc";
    };
    timer?: {
      defaultDurationSec: number;
      shortBreakDurationSec: number;
      longBreakDurationSec: number;
      sessionsBetweenLongBreak: number;
      soundProfileId: string;
      themeId: string;
      autoStartBreak: boolean;
      notificationsEnabled: boolean;
      showTrayCountdown: boolean;
      sidebarRowProgressBg: boolean;
      lastView: "focus" | "grid" | "compact";
    };
    voice?: {
      model: string;
      language: string;
      commandsEnabled: boolean;
      continuousDictation: boolean;
      chunkDuration: number;
    };
    tts?: {
      model: string;
      voice: string;
      speed: number;
    };
    autoTheme?: {
      enabled: boolean;
      pauseOnManualChange: boolean;
      ranges: ThemeScheduleRange[];
    };
    dnd?: {
      enabled: boolean;
      ranges: DndScheduleRange[];
    };
    notifications?: {
      playChimeOnCompletion: boolean;
      chimeSuccessSound: string;
      chimeErrorSound: string;
    };
    aiAssistant: {
      defaultMode: AgentMode;
      appModes: Partial<Record<string, AgentMode>>;
      panelConfigs: Partial<Record<string, Partial<PanelAIConfig>>>;
    };
    developer?: {
      showStoreInspector: boolean;
      showDebugPanel: boolean;
      showAIInspector: boolean;
    };
    clock?: {
      fullscreenTimeoutMs: number;
      fullscreenPressAndHold?: boolean;
      fullscreenFace?:
        | "minimal"
        | "neon"
        | "flip"
        | "analog"
        | "aurora"
        | "wireframe"
        | "rings";
    };
    lastActiveApp:
      | "dashboard"
      | "dailyplan"
      | "explorer"
      | "autoflow"
      | "chat"
      | "messages"
      | "code"
      | "library"
      | "apiclient"
      | "mockserver"
      | "notes"
      | "clipboard"
      | "timer"
      | "appstore"
      | "prompts"
      | "weblinks"
      | "terminal"
      | "monitor"
      | "quickshare"
      | "promptmanager"
      | "webpoint"
      | "storeinspector"
      | "aiinspector"
      | "debug"
      | "settings";
    restoreLastApp: boolean;
    /** When true, settings search uses fuzzy matching; otherwise plain substring. */
    searchFuzzyEnabled?: boolean;
    /**
     * Maximum number of "regular" apps kept mounted at once (keep-alive LRU
     * cap). The active app, the dashboard fallback, meta/dev surfaces, and any
     * app currently running a task are always kept regardless of this value.
     * `0` = unlimited (legacy behavior — never evict).
     */
    keepAliveLimit: number;
    /**
     * IDs of apps that are currently "installed" (visible in the
     * ActivityBar). Managed by the App Store. `dashboard` and `appstore`
     * are always required and cannot be removed from this list.
     */
    enabledApps: Array<
      | "dashboard"
      | "dailyplan"
      | "explorer"
      | "autoflow"
      | "chat"
      | "messages"
      | "code"
      | "library"
      | "apiclient"
      | "mockserver"
      | "notes"
      | "clipboard"
      | "timer"
      | "appstore"
      | "prompts"
      | "weblinks"
      | "terminal"
      | "monitor"
      | "quickshare"
      | "webpoint"
    >;
    /**
     * Newly-launched app ids whose one-time "auto-enable on first load"
     * backfill has already been applied for this user. Once an id is in
     * this list it will NOT be re-injected into `enabledApps` even if the
     * user later disables it from the App Store.
     *
     * Used by `applyAppBackfill` during settings load.
     */
    appBackfillSeen?: string[];
    /**
     * Set once the one-time "default apps reset" has run for this user
     * (see `applyDefaultAppsReset`). Prevents the curated first-load app
     * set from being re-applied on every launch, so the user's later App
     * Store enable/disable choices stick.
     */
    didResetToDefaultApps?: boolean;
    onboarding?: {
      completed: boolean;
    };
    /**
     * Floating Settings window (opens via `Cmd+,` over any host app).
     * `isOpen` is intentionally NOT persisted — window always starts closed.
     */
    settingsDrawer?: {
      /**
       * Window size in CSS pixels. Replaces the legacy `width`-only side
       * panel schema; legacy entries are auto-migrated on first load.
       */
      size?: {
        width: number;
        height: number;
      };
      /**
       * Persisted window position (top-left). Absent = center on next open.
       * Out-of-viewport values are clamped at render time.
       */
      position?: {
        x: number;
        y: number;
      };
      /**
       * @deprecated Legacy side-panel field. Kept for one-time migration
       * in `initDrawerAction.ts`. New code should write `size` instead.
       */
      width?: number;
      /** @deprecated No longer used. */
      pinnedSection?: string;
      /** @deprecated No longer used. */
      lastSection?: string;
    };
  };
  /**
   * Prompt Library (PromptsApp) persistence that lives outside the prompt
   * DB tables. Built-in prompts/categories/folders are re-injected from code
   * on every load, so deleting one is recorded here as a tombstone and
   * filtered out in `loadAll`.
   */
  promptManager?: {
    hiddenBuiltInIds: string[];
  };
  theme: string;
}

// ── Defaults ─────────────────────────────────────────────────────────

export const APP_DATA_DEFAULTS: AppData = {
  settings: {
    user: {
      email: "",
    },
    dashboard: {
      lazyLoadTabs: true,
      snippetsTileWidth: "half",
      liveSportsTileWidth: "half",
      newsTileWidth: "half",
      stocksTileWidth: "half",
      todaysAgendaTileWidth: "half",
      currentlyReadingTileWidth: "half",
      clipboardQuickAccessTileWidth: "half",
      quickPromptsTileWidth: "half",
      timerTileWidth: "half",
      keepAwakeTileWidth: "half",
      timeCalendarTileWidth: "half",
      emailsAttentionTileWidth: "half",
      dashboardClockUse24Hour: false,
      tileOrder: [],
      tileVisibility: {},
    },
    explorer: {
      defaultView: "detailed",
      sortField: "name",
      sortDirection: "asc",
      showHidden: false,
      hideFolders: false,
      mixFoldersWithFiles: false,
      dimHiddenFiles: true,
      singleClickOpen: false,
      shortcutVisibility: EXPLORER_SHORTCUT_VISIBILITY_DEFAULTS,
    },
    layout: {
      activityBarPosition: "left",
      sidebarPosition: "left",
      showActivityBarLabels: false,
      globalFont: "segoe-ui",
      fontSize: 14,
    },
    editor: {
      fontSize: 10,
    },
    chat: {
      systemPrompt: "You are a helpful assistant.",
      model: "claude-opus-4.6",
      modelUserSet: false,
      widthPercent: 100,
    },
    library: {
      readingFont: "ia-writer-quattro",
      contentWidth: "medium",
      inlineImageSize: "medium",
      defaultBookmarkView: "flat",
      dfHideSidebar: true,
      dfHideRightPanel: true,
      dfHideActivityBar: true,
      dfHideHeader: true,
      dfHideBottomNav: true,
      dfShowHeaderOnHover: true,
      cacheImagesForOffline: true,
      defaultLanguage: "english",
    },
    notes: {
      contentWidth: "medium",
      showLabels: true,
      mode: "edit",
      autoScrollEnabled: false,
      autoScrollSpeed: 1.0,
      autoScrollMode: "continuous",
      autoScrollStepPixels: 150,
      autoScrollStepIntervalMs: 10000,
    },
    messages: {
      contentWidth: "medium",
    },
    general: {
      explainLanguage: "english",
      recordNotifications: true,
      showScrollPercentage: true,
      showScrollProgressBar: true,
    },
    security: {
      enabled: false,
      type: "password",
      hash: "",
      salt: "",
      lockTimeoutMinutes: 5,
      lockOnFocusLoss: false,
      lockOnLaunch: true,
      maxFailedAttempts: 5,
      preventScreenCapture: false,
    },
    telemetry: {
      enabled: false,
      consentDecided: false,
      anonymousId: "",
      consentedAt: null,
    },
    dailyPlan: {
      workStartTime: null,
      workEndTime: null,
      lunchStartTime: null,
      lunchEndTime: null,
      statusTemplate: null,
    },
    apiClient: {
      sortField: "createdAt",
      sortDirection: "desc",
    },
    terminal: {
      fontFamily: null,
      fontSize: 13,
      lineHeight: 1.2,
      letterSpacing: 0,
      fontWeight: "normal",
      fontLigatures: false,
      insertPromptAutoRun: false,
      gitPanelWidth: 300,
      defaultThemeId: null,
    },
    keyboard: {
      overrides: {},
      disabled: [],
    },
    clipboard: {
      autoDescribeImages: true,
      maxItems: 500,
      addOnce: false,
      syntaxHighlightCode: true,
      timelineSortDirection: "desc",
    },
    timer: {
      defaultDurationSec: 1500,
      shortBreakDurationSec: 300,
      longBreakDurationSec: 900,
      sessionsBetweenLongBreak: 4,
      soundProfileId: "gentle-bell",
      themeId: "default",
      autoStartBreak: true,
      notificationsEnabled: true,
      showTrayCountdown: true,
      sidebarRowProgressBg: false,
      lastView: "focus",
    },
    voice: {
      model: "base",
      language: "auto",
      commandsEnabled: true,
      continuousDictation: true,
      chunkDuration: 2,
    },
    tts: {
      model: "kokoro-en",
      voice: "af_heart",
      speed: 1.0,
    },
    autoTheme: {
      enabled: false,
      pauseOnManualChange: true,
      ranges: [],
    },
    dnd: {
      enabled: false,
      ranges: [],
    },
    notifications: {
      playChimeOnCompletion: true,
      chimeSuccessSound: "chime",
      chimeErrorSound: "soft-pop",
    },
    aiAssistant: {
      defaultMode: "ask",
      appModes: {},
      panelConfigs: {},
    },
    developer: {
      showStoreInspector: false,
      showDebugPanel: false,
      showAIInspector: false,
    },
    clock: {
      fullscreenFace: "minimal",
      fullscreenTimeoutMs: 3000,
      fullscreenPressAndHold: false,
    },
    lastActiveApp: "dashboard",
    restoreLastApp: true,
    searchFuzzyEnabled: false,
    keepAliveLimit: 3,
    enabledApps: [...FIRST_LOAD_ENABLED_APPS],
    onboarding: {
      completed: false,
    },
    settingsDrawer: {
      size: { width: 900, height: 640 },
    },
  },
  promptManager: {
    hiddenBuiltInIds: [],
  },
  theme: "morning-coffee",
};

// ── Tauri Store ──────────────────────────────────────────────────────

const store = new LazyStore('app-data.json', { autoSave: 100 })

// ── Deep merge ───────────────────────────────────────────────────────

function deepMerge<T>(defaults: T, overrides: unknown): T {
  if (
    typeof defaults !== 'object' ||
    defaults === null ||
    Array.isArray(defaults) ||
    typeof overrides !== 'object' ||
    overrides === null ||
    Array.isArray(overrides)
  ) {
    return (overrides ?? defaults) as T
  }

  const result = { ...defaults } as Record<string, unknown>
  const defaultObj = defaults as Record<string, unknown>
  const overrideObj = overrides as Record<string, unknown>
  const allKeys = new Set([...Object.keys(defaultObj), ...Object.keys(overrideObj)])
  for (const key of allKeys) {
    if (key in overrideObj) {
      result[key] = key in defaultObj
        ? deepMerge(defaultObj[key], overrideObj[key])
        : overrideObj[key]
    }
  }
  return result as T
}

// ── Cache ─────────────────────────────────────────────────────────────

let cache: AppData | null = null
let inflight: Promise<AppData> | null = null

// ── Load / Save ──────────────────────────────────────────────────────

export async function loadAppData(): Promise<AppData> {
  if (cache) return cache

  if (inflight) return inflight

  inflight = (async () => {
    try {
      const raw = await store.get<AppData>('app-data')
      if (raw && typeof raw === 'object') {
        cache = deepMerge(APP_DATA_DEFAULTS, raw)
        return cache
      }
    } catch {
      // ignore – defaults will be used
    }
    cache = structuredClone(APP_DATA_DEFAULTS)
    await store.set('app-data', cache).catch(() => {})
    return cache
  })().finally(() => {
    inflight = null
  })

  return inflight
}

export async function saveAppData(data: AppData): Promise<void> {
  cache = data
  store.set('app-data', data).catch(() => {
    cache = null
  })
}

let patchTimer: ReturnType<typeof setTimeout> | null = null
let pendingUpdaters: Array<(data: AppData) => void> = []

export async function patchAppData(updater: (data: AppData) => void): Promise<void> {
  pendingUpdaters.push(updater)
  if (patchTimer) clearTimeout(patchTimer)
  patchTimer = setTimeout(async () => {
    const updaters = pendingUpdaters;
    pendingUpdaters = [];
    patchTimer = null;
    try {
      const data = await loadAppData();
      const copy = structuredClone(data);
      for (const fn of updaters) fn(copy);
      await saveAppData(copy);
    } catch {
      // logged in saveAppData
    }
  }, 300);
}

export function invalidateAppDataCache(): void {
  cache = null
  inflight = null
}
