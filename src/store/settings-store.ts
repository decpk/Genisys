import { create } from 'zustand'

import { FONT_CONFIG } from '@/lib/fonts'
import type { Language } from '@/lib/languages'
import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'
import type { DndScheduleRange } from '@/frameworks/notification/dnd'
import { DND_DEFAULTS } from '@/frameworks/notification/dnd'
import type { AgentMode } from '@/components/Chat/components/AgentModeSelector'
import { APP_DATA_DEFAULTS, loadAppData, patchAppData } from './app-data'
import type { TileWidthSetting } from './app-data'
import {
  applyContentProtectionAll,
  applyContentProtectionCurrent,
} from './content-protection'
import { setEnabledAppsAction } from './settings-store/actions/setEnabledAppsAction'
import { setKeepAliveLimitAction } from './settings-store/actions/setKeepAliveLimitAction'
import { toggleAppEnabledAction } from './settings-store/actions/toggleAppEnabledAction'
import { normalizeEnabledApps } from './settings-store/utils/normalizeEnabledApps'
import { migrateRenamedAppViews } from './settings-store/utils/migrateRenamedAppViews'
import {
  clearPrivateBrowserLocalStorage,
  migratePrivateBrowserRemoval,
} from './settings-store/utils/migratePrivateBrowserRemoval'
import { applyAppBackfill } from './settings-store/utils/applyAppBackfill'
import { applyDefaultAppsReset } from './settings-store/utils/applyDefaultAppsReset'
import { resolveDefaultModelAction } from './settings-store/actions/resolveDefaultModelAction'
import type { PanelAIConfig } from './panel-ai-config.types'
import { DEFAULT_PANEL_AI_CONFIG } from './panel-ai-config.constants'
import {
  EXPLORER_SHORTCUT_VISIBILITY_DEFAULTS,
  type ExplorerShortcutKey,
  type ExplorerShortcutVisibility,
} from "./explorer-shortcut-keys";

// ── Types ────────────────────────────────────────────────────────────

export type ExplorerViewMode = 'list' | 'grid' | 'detailed' | 'compact' | 'thumbnail'
export type FilesSortBy = 'name-asc' | 'name-desc' | 'path-asc' | 'path-desc' | 'type'
export type FilesGroupBy = 'none' | 'extension' | 'changeType' | 'directory' | 'custom'

export type ExplorerSortField = 'name' | 'extension' | 'path'
export type ExplorerSortDirection = 'asc' | 'desc'
export type ApiClientSortField = 'name' | 'method' | 'createdAt' | 'updatedAt'
export type ApiClientSortDirection = 'asc' | 'desc'
export type FullscreenClockFace = 'minimal' | 'neon' | 'flip' | 'analog' | 'aurora' | 'wireframe' | 'rings'

export type CodeFontWeight = 'normal' | 'medium' | 'bold'
export type ClipboardTimelineSortDirection = 'desc' | 'asc'
export type ActivityBarPosition = 'left' | 'right' | 'top' | 'bottom'
export type SidebarPosition = 'left' | 'right'
export type ReadingFont = 'system' | 'serif' | 'mono' | 'literata' | 'lora' | 'source-serif' | 'inter' | 'newsreader' | 'crimson-pro' | 'ia-writer-quattro' | 'geist' | 'geist-mono' | 'poppins' | 'segoe-ui' | 'cascadia-code' | 'ubuntu-sans' | 'fira-sans'
export type ContentWidth = 'narrow' | 'medium' | 'wide' | 'full-inset' | 'full'
export type NotesMode = 'view' | 'edit'
export type NotesScrollMode = 'continuous' | 'stepped'
export type LibraryInlineImageSize = 'small' | 'medium' | 'large' | 'full'
export type BookmarkViewMode = 'grouped' | 'flat' | 'recent'
export type ExplainLanguage = 'english' | 'hindi' | 'hinglish' | 'spanish' | 'french' | 'german' | 'japanese' | 'chinese' | 'korean' | 'arabic' | 'portuguese' | 'russian' | 'italian' | 'dutch' | 'turkish' | 'bengali'
export type SecurityType = 'pin' | 'password'
export type AppView =
  | "dashboard"
  | "dailyplan"
  | "explorer"
  | "quickshare"
  | "autoflow"
  | "webpoint"
  | "chat"
  | "messages"
  | "terminal"
  | "monitor"
  | "library"
  | "apiclient"
  | "mockserver"
  | "notes"
  | "clipboard"
  | "timer"
  | "appstore"
  | "prompts"
  | "weblinks"
  | "promptmanager"
  | "storeinspector"
  | "aiinspector"
  | "debug"
  | "settings";

export interface CustomGroupRule {
  id: string
  pattern: string
  excludePattern: string
  group: string
}

interface SettingsState {
  isLoaded: boolean;
  userEmail: string;
  telemetryEnabled: boolean;
  telemetryConsentDecided: boolean;
  telemetryAnonymousId: string;
  defaultExplorerView: ExplorerViewMode;
  activityBarPosition: ActivityBarPosition;
  sidebarPosition: SidebarPosition;
  showActivityBarLabels: boolean;
  activityBarHidden: boolean;
  explorerSortField: ExplorerSortField;
  explorerSortDirection: ExplorerSortDirection;
  explorerShowHidden: boolean;
  explorerHideFolders: boolean;
  explorerMixFoldersWithFiles: boolean;
  explorerDimHiddenFiles: boolean;
  explorerSingleClickOpen: boolean;
  explorerShortcutVisibility: ExplorerShortcutVisibility;
  globalFont: ReadingFont;
  fontSize: number;
  editorFontSize: number;
  chatSystemPrompt: string;
  chatModel: string;
  chatModelUserSet: boolean;
  /**
   * Ids of the models currently available from the live model provider.
   * In-memory only (repopulated each boot); used to validate/heal the
   * resolved model before it is sent so we never request a model that the
   * configured provider no longer offers.
   */
  availableModelIds: string[];
  chatWidthPercent: number;
  dashboardLazyLoadTabs: boolean;
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
  lastActiveApp: AppView;
  restoreLastApp: boolean;
  searchFuzzyEnabled: boolean;
  /**
   * Max number of "regular" apps kept mounted at once (keep-alive LRU cap).
   * `0` = unlimited. The active app, dashboard, meta/dev surfaces, and apps
   * running a task are always kept regardless.
   */
  keepAliveLimit: number;
  /**
   * IDs of apps the user has "installed" (visible in the ActivityBar).
   * Managed by the App Store. `dashboard` and `appstore` are always
   * present (see `ALWAYS_ENABLED_APPS`).
   */
  enabledApps: AppView[];
  libraryReadingFont: ReadingFont;
  libraryContentWidth: ContentWidth;
  libraryInlineImageSize: LibraryInlineImageSize;
  libraryDefaultBookmarkView: BookmarkViewMode;
  libraryDFHideSidebar: boolean;
  libraryDFHideRightPanel: boolean;
  libraryDFHideActivityBar: boolean;
  libraryDFHideHeader: boolean;
  libraryDFHideBottomNav: boolean;
  libraryDFShowHeaderOnHover: boolean;
  libraryCacheImagesForOffline: boolean;
  libraryDefaultLanguage: Language;
  notesContentWidth: ContentWidth;
  notesShowLabels: boolean;
  notesMode: NotesMode;
  messagesContentWidth: ContentWidth;
  notesAutoScrollEnabled: boolean;
  notesAutoScrollSpeed: number;
  notesAutoScrollMode: NotesScrollMode;
  notesAutoScrollStepPixels: number;
  notesAutoScrollStepIntervalMs: number;
  clipboardMaxItems: number;
  clipboardAddOnce: boolean;
  clipboardSyntaxHighlightCode: boolean;
  clipboardAutoDescribeImages: boolean;
  clipboardTimelineSortDirection: ClipboardTimelineSortDirection;
  explainLanguage: ExplainLanguage;
  recordNotifications: boolean;
  showScrollPercentage: boolean;
  showScrollProgressBar: boolean;
  securityEnabled: boolean;
  securityType: SecurityType;
  securityHash: string;
  securitySalt: string;
  securityLockTimeoutMinutes: number;
  securityLockOnFocusLoss: boolean;
  securityLockOnLaunch: boolean;
  securityMaxFailedAttempts: number;
  securityPreventScreenCapture: boolean;
  fullscreenClockFace: FullscreenClockFace;
  fullscreenClockTimeoutMs: number;
  fullscreenClockPressAndHold: boolean;
  devShowStoreInspector: boolean;
  devShowDebugPanel: boolean;
  devShowAIInspector: boolean;
  devShowDebugTools: boolean;
  apiClientSortField: ApiClientSortField;
  apiClientSortDirection: ApiClientSortDirection;
  terminalFontFamily: string | null;
  terminalFontSize: number;
  terminalLineHeight: number;
  terminalLetterSpacing: number;
  terminalFontWeight: CodeFontWeight;
  terminalFontLigatures: boolean;
  terminalInsertPromptAutoRun: boolean;
  terminalHistoryAutocomplete: boolean;
  terminalGitPanelWidth: number;
  terminalDefaultThemeId: string | null;
  voiceModel: string;
  voiceLanguage: string;
  voiceCommandsEnabled: boolean;
  voiceContinuousDictation: boolean;
  voiceChunkDuration: number;
  ttsModel: string;
  ttsVoice: string;
  ttsSpeed: number;
  dpWorkStartTime: string | null;
  dpWorkEndTime: string | null;
  dpLunchStartTime: string | null;
  dpLunchEndTime: string | null;
  dpStatusTemplate: string | null;
  autoThemeEnabled: boolean;
  autoThemePauseOnManualChange: boolean;
  autoThemeRanges: ThemeScheduleRange[];
  dndEnabled: boolean;
  dndRanges: DndScheduleRange[];
  hasCompletedOnboarding: boolean;
  aiDefaultMode: AgentMode;
  aiAppModes: Partial<Record<string, AgentMode>>;
  panelAIConfigs: Partial<Record<string, Partial<PanelAIConfig>>>;
}

interface SettingsActions {
  initSettings: () => Promise<void>;
  setUserEmail: (email: string) => void;
  setTelemetryEnabled: (enabled: boolean) => void;
  setTelemetryConsentDecided: (decided: boolean) => void;
  ensureTelemetryAnonymousId: () => string;
  setDefaultExplorerView: (mode: ExplorerViewMode) => void;
  setActivityBarPosition: (position: ActivityBarPosition) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
  setShowActivityBarLabels: (show: boolean) => void;
  setActivityBarHidden: (hidden: boolean) => void;
  toggleActivityBar: () => void;
  setExplorerSortField: (field: ExplorerSortField) => void;
  setExplorerSortDirection: (direction: ExplorerSortDirection) => void;
  setExplorerShowHidden: (show: boolean) => void;
  setExplorerHideFolders: (hide: boolean) => void;
  setExplorerMixFoldersWithFiles: (mix: boolean) => void;
  setExplorerDimHiddenFiles: (dim: boolean) => void;
  setExplorerSingleClickOpen: (single: boolean) => void;
  setExplorerShortcutVisibility: (
    key: ExplorerShortcutKey,
    visible: boolean,
  ) => void;
  setGlobalFont: (font: ReadingFont) => void;
  setFontSize: (size: number) => void;
  setEditorFontSize: (size: number) => void;
  setChatSystemPrompt: (prompt: string) => void;
  setChatModel: (model: string) => void;
  setAvailableModelIds: (ids: string[]) => void;
  reconcileModels: () => void;
  setChatWidthPercent: (percent: number) => void;
  setDashboardLazyLoadTabs: (enabled: boolean) => void;
  setSnippetsTileWidth: (width: TileWidthSetting) => void;
  setLiveSportsTileWidth: (width: TileWidthSetting) => void;
  setNewsTileWidth: (width: TileWidthSetting) => void;
  setStocksTileWidth: (width: TileWidthSetting) => void;
  setTodaysAgendaTileWidth: (width: TileWidthSetting) => void;
  setCurrentlyReadingTileWidth: (width: TileWidthSetting) => void;
  setClipboardQuickAccessTileWidth: (width: TileWidthSetting) => void;
  setQuickPromptsTileWidth: (width: TileWidthSetting) => void;
  setTimerTileWidth: (width: TileWidthSetting) => void;
  setKeepAwakeTileWidth: (width: TileWidthSetting) => void;
  setTimeCalendarTileWidth: (width: TileWidthSetting) => void;
  setEmailsAttentionTileWidth: (width: TileWidthSetting) => void;
  setDashboardClockUse24Hour: (enabled: boolean) => void;
  setTileOrder: (order: string[]) => void;
  setTileVisibility: (tileId: string, visible: boolean) => void;
  setLastActiveApp: (app: AppView) => void;
  setRestoreLastApp: (enabled: boolean) => void;
  setSearchFuzzyEnabled: (enabled: boolean) => void;
  setKeepAliveLimit: (limit: number) => void;
  setEnabledApps: (apps: AppView[]) => void;
  toggleAppEnabled: (app: AppView) => void;
  isAppEnabled: (app: AppView) => boolean;
  setLibraryReadingFont: (font: ReadingFont) => void;
  setLibraryContentWidth: (width: ContentWidth) => void;
  setLibraryInlineImageSize: (size: LibraryInlineImageSize) => void;
  setLibraryDefaultBookmarkView: (mode: BookmarkViewMode) => void;
  setLibraryDFHideSidebar: (hide: boolean) => void;
  setLibraryDFHideRightPanel: (hide: boolean) => void;
  setLibraryDFHideActivityBar: (hide: boolean) => void;
  setLibraryDFHideHeader: (hide: boolean) => void;
  setLibraryDFHideBottomNav: (hide: boolean) => void;
  setLibraryDFShowHeaderOnHover: (show: boolean) => void;
  setLibraryCacheImagesForOffline: (enabled: boolean) => void;
  setLibraryDefaultLanguage: (lang: Language) => void;
  setNotesContentWidth: (width: ContentWidth) => void;
  setMessagesContentWidth: (width: ContentWidth) => void;
  setNotesShowLabels: (show: boolean) => void;
  setNotesMode: (mode: NotesMode) => void;
  setNotesAutoScrollEnabled: (enabled: boolean) => void;
  setNotesAutoScrollSpeed: (speed: number) => void;
  setNotesAutoScrollMode: (mode: NotesScrollMode) => void;
  setNotesAutoScrollStepPixels: (pixels: number) => void;
  setNotesAutoScrollStepIntervalMs: (intervalMs: number) => void;
  setClipboardMaxItems: (count: number) => void;
  setClipboardAddOnce: (enabled: boolean) => void;
  setClipboardSyntaxHighlightCode: (enabled: boolean) => void;
  setClipboardAutoDescribeImages: (enabled: boolean) => void;
  setClipboardTimelineSortDirection: (
    direction: ClipboardTimelineSortDirection,
  ) => void;
  setExplainLanguage: (lang: ExplainLanguage) => void;
  setRecordNotifications: (enabled: boolean) => void;
  setShowScrollPercentage: (enabled: boolean) => void;
  setShowScrollProgressBar: (enabled: boolean) => void;
  playChimeOnCompletion: boolean;
  chimeSuccessSound: string;
  chimeErrorSound: string;
  setPlayChimeOnCompletion: (enabled: boolean) => void;
  setChimeSuccessSound: (soundId: string) => void;
  setChimeErrorSound: (soundId: string) => void;
  setSecurityEnabled: (enabled: boolean) => void;
  setSecurityType: (type: SecurityType) => void;
  setSecurityCredentials: (hash: string, salt: string) => void;
  setSecurityLockTimeoutMinutes: (minutes: number) => void;
  setSecurityLockOnFocusLoss: (enabled: boolean) => void;
  setSecurityLockOnLaunch: (enabled: boolean) => void;
  setFullscreenClockFace: (face: FullscreenClockFace) => void;
  setSecurityMaxFailedAttempts: (attempts: number) => void;
  setSecurityPreventScreenCapture: (enabled: boolean) => void;
  setFullscreenClockTimeoutMs: (ms: number) => void;
  setFullscreenClockPressAndHold: (enabled: boolean) => void;
  setDevShowStoreInspector: (show: boolean) => void;
  setDevShowDebugPanel: (show: boolean) => void;
  setDevShowAIInspector: (show: boolean) => void;
  setDevShowDebugTools: (show: boolean) => void;
  setApiClientSortField: (field: ApiClientSortField) => void;
  setApiClientSortDirection: (direction: ApiClientSortDirection) => void;
  setTerminalFontFamily: (family: string | null) => void;
  setTerminalFontSize: (size: number) => void;
  setTerminalLineHeight: (value: number) => void;
  setTerminalLetterSpacing: (value: number) => void;
  setTerminalFontWeight: (weight: CodeFontWeight) => void;
  setTerminalFontLigatures: (enabled: boolean) => void;
  setTerminalInsertPromptAutoRun: (enabled: boolean) => void;
  setTerminalHistoryAutocomplete: (enabled: boolean) => void;
  setTerminalGitPanelWidth: (width: number) => void;
  setTerminalDefaultThemeId: (id: string | null) => void;
  setVoiceModel: (model: string) => void;
  setVoiceLanguage: (language: string) => void;
  setVoiceCommandsEnabled: (enabled: boolean) => void;
  setVoiceContinuousDictation: (enabled: boolean) => void;
  setVoiceChunkDuration: (duration: number) => void;
  setTtsModel: (model: string) => void;
  setTtsVoice: (voice: string) => void;
  setTtsSpeed: (speed: number) => void;
  setDpWorkHours: (data: {
    workStartTime: string | null;
    workEndTime: string | null;
    lunchStartTime: string | null;
    lunchEndTime: string | null;
  }) => void;
  clearDpWorkHours: () => void;
  clearDpLunchHours: () => void;
  setDpStatusTemplate: (template: string | null) => void;
  setAutoThemeEnabled: (enabled: boolean) => void;
  setAutoThemePauseOnManualChange: (enabled: boolean) => void;
  setAutoThemeRanges: (ranges: ThemeScheduleRange[]) => void;
  setDndEnabled: (enabled: boolean) => void;
  setDndRanges: (ranges: DndScheduleRange[]) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setAiDefaultMode: (mode: AgentMode) => void;
  setAiAppMode: (appId: string, mode: AgentMode | undefined) => void;
  getAiModeForApp: (appId: string) => AgentMode;
  getPanelAIConfig: (appId: string) => PanelAIConfig;
  setPanelAIConfig: (appId: string, config: Partial<PanelAIConfig>) => void;
}

// ── Defaults ─────────────────────────────────────────────────────────

const defaults = APP_DATA_DEFAULTS.settings

// ── Helpers ──────────────────────────────────────────────────────────

function applyGlobalFont(font: ReadingFont): void {
  document.documentElement.style.setProperty('--font-sans', FONT_CONFIG[font].family)
}

function applyFontSize(size: number): void {
  document.documentElement.style.fontSize = `${size}px`
}

// ── Store ────────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  (set, get) => ({
    isLoaded: false,
    userEmail: defaults.user.email,
    telemetryEnabled: defaults.telemetry.enabled,
    telemetryConsentDecided: defaults.telemetry.consentDecided,
    telemetryAnonymousId: defaults.telemetry.anonymousId,
    defaultExplorerView: defaults.explorer.defaultView,
    activityBarPosition: defaults.layout.activityBarPosition,
    sidebarPosition: defaults.layout.sidebarPosition,
    showActivityBarLabels: defaults.layout.showActivityBarLabels,
    // Ephemeral (NOT persisted): the Activity Bar always shows on relaunch.
    activityBarHidden: false,
    explorerSortField: defaults.explorer.sortField,
    explorerSortDirection: defaults.explorer.sortDirection,
    explorerShowHidden: defaults.explorer.showHidden,
    explorerHideFolders: defaults.explorer.hideFolders,
    explorerMixFoldersWithFiles: defaults.explorer.mixFoldersWithFiles,
    explorerDimHiddenFiles: defaults.explorer.dimHiddenFiles,
    explorerSingleClickOpen: defaults.explorer.singleClickOpen,
    explorerShortcutVisibility:
      defaults.explorer.shortcutVisibility ??
      EXPLORER_SHORTCUT_VISIBILITY_DEFAULTS,
    globalFont: defaults.layout.globalFont,
    fontSize: defaults.layout.fontSize,
    editorFontSize: defaults.editor?.fontSize ?? 10,
    chatSystemPrompt: defaults.chat.systemPrompt,
    chatModel: defaults.chat.model,
    chatModelUserSet: defaults.chat.modelUserSet ?? false,
    availableModelIds: [],
    chatWidthPercent: defaults.chat.widthPercent,
    dashboardLazyLoadTabs: defaults.dashboard.lazyLoadTabs,
    snippetsTileWidth: defaults.dashboard.snippetsTileWidth,
    liveSportsTileWidth: defaults.dashboard.liveSportsTileWidth ?? "half",
    newsTileWidth: defaults.dashboard.newsTileWidth ?? "full",
    stocksTileWidth: defaults.dashboard.stocksTileWidth ?? "half",
    todaysAgendaTileWidth: defaults.dashboard.todaysAgendaTileWidth ?? "half",
    currentlyReadingTileWidth:
      defaults.dashboard.currentlyReadingTileWidth ?? "half",
    clipboardQuickAccessTileWidth:
      defaults.dashboard.clipboardQuickAccessTileWidth ?? "third",
    quickPromptsTileWidth: defaults.dashboard.quickPromptsTileWidth ?? "third",
    timerTileWidth: defaults.dashboard.timerTileWidth ?? "small",
    keepAwakeTileWidth: defaults.dashboard.keepAwakeTileWidth ?? "half",
    timeCalendarTileWidth: defaults.dashboard.timeCalendarTileWidth ?? "half",
    emailsAttentionTileWidth:
      defaults.dashboard.emailsAttentionTileWidth ?? "half",
    dashboardClockUse24Hour:
      defaults.dashboard.dashboardClockUse24Hour ?? false,
    tileOrder: defaults.dashboard.tileOrder,
    tileVisibility: defaults.dashboard.tileVisibility ?? {},
    lastActiveApp: defaults.lastActiveApp as AppView,
    restoreLastApp: defaults.restoreLastApp,
    searchFuzzyEnabled: defaults.searchFuzzyEnabled ?? false,
    keepAliveLimit: defaults.keepAliveLimit ?? 3,
    enabledApps: normalizeEnabledApps(
      (defaults.enabledApps ?? []) as AppView[],
    ),
    libraryReadingFont: defaults.library.readingFont,
    libraryContentWidth: defaults.library.contentWidth,
    libraryInlineImageSize: defaults.library.inlineImageSize,
    libraryDefaultBookmarkView: defaults.library.defaultBookmarkView,
    libraryDFHideSidebar: defaults.library.dfHideSidebar,
    libraryDFHideRightPanel: defaults.library.dfHideRightPanel,
    libraryDFHideActivityBar: defaults.library.dfHideActivityBar,
    libraryDFHideHeader: defaults.library.dfHideHeader,
    libraryDFHideBottomNav: defaults.library.dfHideBottomNav,
    libraryDFShowHeaderOnHover: defaults.library.dfShowHeaderOnHover,
    libraryCacheImagesForOffline:
      defaults.library.cacheImagesForOffline ?? true,
    libraryDefaultLanguage: (defaults.library.defaultLanguage ??
      "english") as Language,
    notesContentWidth: (defaults.notes?.contentWidth ??
      "medium") as ContentWidth,
    messagesContentWidth: (defaults.messages?.contentWidth ??
      "medium") as ContentWidth,
    notesShowLabels: defaults.notes?.showLabels ?? true,
    notesMode: (defaults.notes?.mode ?? "edit") as NotesMode,
    notesAutoScrollEnabled: defaults.notes?.autoScrollEnabled ?? false,
    notesAutoScrollSpeed: defaults.notes?.autoScrollSpeed ?? 1.0,
    notesAutoScrollMode: (defaults.notes?.autoScrollMode ??
      "continuous") as NotesScrollMode,
    notesAutoScrollStepPixels: defaults.notes?.autoScrollStepPixels ?? 300,
    notesAutoScrollStepIntervalMs:
      defaults.notes?.autoScrollStepIntervalMs ?? 3000,
    clipboardMaxItems: defaults.clipboard?.maxItems ?? 500,
    clipboardAddOnce: defaults.clipboard?.addOnce ?? false,
    clipboardSyntaxHighlightCode:
      defaults.clipboard?.syntaxHighlightCode ?? true,
    clipboardAutoDescribeImages:
      defaults.clipboard?.autoDescribeImages ?? true,
    clipboardTimelineSortDirection: (defaults.clipboard
      ?.timelineSortDirection ?? "desc") as ClipboardTimelineSortDirection,
    explainLanguage: defaults.general.explainLanguage,
    recordNotifications: defaults.general.recordNotifications,
    showScrollPercentage: defaults.general.showScrollPercentage ?? true,
    showScrollProgressBar: defaults.general.showScrollProgressBar ?? true,
    playChimeOnCompletion:
      defaults.notifications?.playChimeOnCompletion ?? true,
    chimeSuccessSound: defaults.notifications?.chimeSuccessSound ?? "chime",
    chimeErrorSound: defaults.notifications?.chimeErrorSound ?? "soft-pop",
    securityEnabled: defaults.security.enabled,
    securityType: defaults.security.type,
    securityHash: defaults.security.hash,
    securitySalt: defaults.security.salt,
    securityLockTimeoutMinutes: defaults.security.lockTimeoutMinutes,
    securityLockOnFocusLoss: defaults.security.lockOnFocusLoss,
    fullscreenClockFace: (defaults.clock?.fullscreenFace ??
      "minimal") as FullscreenClockFace,
    securityLockOnLaunch: defaults.security.lockOnLaunch,
    securityMaxFailedAttempts: defaults.security.maxFailedAttempts,
    securityPreventScreenCapture:
      defaults.security.preventScreenCapture ?? false,
    fullscreenClockTimeoutMs: defaults.clock?.fullscreenTimeoutMs ?? 3000,
    fullscreenClockPressAndHold:
      defaults.clock?.fullscreenPressAndHold ?? false,
    devShowStoreInspector: defaults.developer?.showStoreInspector ?? false,
    devShowDebugPanel: defaults.developer?.showDebugPanel ?? false,
    devShowAIInspector: defaults.developer?.showAIInspector ?? false,
    devShowDebugTools:
      defaults.developer?.showDebugTools ??
      defaults.developer?.showStoreInspector ??
      defaults.developer?.showDebugPanel ??
      defaults.developer?.showAIInspector ??
      false,
    apiClientSortField: defaults.apiClient.sortField as ApiClientSortField,
    apiClientSortDirection: defaults.apiClient
      .sortDirection as ApiClientSortDirection,
    terminalFontFamily: defaults.terminal?.fontFamily ?? null,
    terminalFontSize: defaults.terminal?.fontSize ?? 13,
    terminalLineHeight: defaults.terminal?.lineHeight ?? 1.2,
    terminalLetterSpacing: defaults.terminal?.letterSpacing ?? 0,
    terminalFontWeight: (defaults.terminal?.fontWeight ??
      "normal") as CodeFontWeight,
    terminalFontLigatures: defaults.terminal?.fontLigatures ?? false,
    terminalInsertPromptAutoRun:
      defaults.terminal?.insertPromptAutoRun ?? false,
    terminalHistoryAutocomplete:
      defaults.terminal?.historyAutocomplete ?? true,
    terminalGitPanelWidth: defaults.terminal?.gitPanelWidth ?? 300,
    terminalDefaultThemeId: defaults.terminal?.defaultThemeId ?? null,
    voiceModel: defaults.voice?.model ?? "base",
    voiceLanguage: defaults.voice?.language ?? "auto",
    voiceCommandsEnabled: defaults.voice?.commandsEnabled ?? true,
    voiceContinuousDictation: defaults.voice?.continuousDictation ?? true,
    voiceChunkDuration: defaults.voice?.chunkDuration ?? 2,
    ttsModel: defaults.tts?.model ?? "kokoro-en",
    ttsVoice: defaults.tts?.voice ?? "af_heart",
    ttsSpeed: defaults.tts?.speed ?? 1.0,
    dpWorkStartTime: defaults.dailyPlan?.workStartTime ?? null,
    dpWorkEndTime: defaults.dailyPlan?.workEndTime ?? null,
    dpLunchStartTime: defaults.dailyPlan?.lunchStartTime ?? null,
    dpLunchEndTime: defaults.dailyPlan?.lunchEndTime ?? null,
    dpStatusTemplate: defaults.dailyPlan?.statusTemplate ?? null,
    autoThemeEnabled: defaults.autoTheme?.enabled ?? false,
    autoThemePauseOnManualChange:
      defaults.autoTheme?.pauseOnManualChange ?? true,
    autoThemeRanges: defaults.autoTheme?.ranges ?? [],
    dndEnabled: defaults.dnd?.enabled ?? DND_DEFAULTS.enabled,
    dndRanges: defaults.dnd?.ranges ?? DND_DEFAULTS.ranges,
    hasCompletedOnboarding: defaults.onboarding?.completed ?? false,
    aiDefaultMode: defaults.aiAssistant.defaultMode,
    aiAppModes: defaults.aiAssistant.appModes,
    panelAIConfigs: defaults.aiAssistant.panelConfigs,

    initSettings: async () => {
      const appData = await loadAppData();
      const { settings } = appData;
      // One-time rename migration: previewer → weblinks (mode + persisted ids).
      if (migrateRenamedAppViews(settings)) {
        patchAppData((d) => {
          migrateRenamedAppViews(d.settings);
        });
      }
      // One-time cleanup for the removed "Web Browser" (private browser) tile:
      // strip its stale tile id / width from persisted settings + localStorage.
      if (migratePrivateBrowserRemoval(settings)) {
        patchAppData((d) => {
          migratePrivateBrowserRemoval(d.settings);
        });
      }
      clearPrivateBrowserLocalStorage();
      // One-time reset of enabled apps to the curated first-load set.
      // Applies to NEW installs and existing users alike, exactly once
      // (guarded by `didResetToDefaultApps`). Also seeds `appBackfillSeen`
      // so the backfill pass below does not re-add the apps we just
      // disabled. Reversible afterwards via the App Store.
      if (applyDefaultAppsReset(settings)) {
        patchAppData((d) => {
          applyDefaultAppsReset(d.settings);
        });
      }
      // Auto-inject any newly-launched apps (e.g. `prompts`) into the
      // existing user's enabledApps list on first load. Persists a
      // "seen" marker so the choice can later be reversed via the
      // App Store without coming back on next launch.
      const backfilled = applyAppBackfill(
        normalizeEnabledApps((settings.enabledApps ?? []) as AppView[]),
        settings.appBackfillSeen,
      );
      if (backfilled.mutated) {
        patchAppData((d) => {
          d.settings.enabledApps =
            backfilled.enabledApps as typeof d.settings.enabledApps;
          d.settings.appBackfillSeen = backfilled.appBackfillSeen;
        });
      }
      set({
        isLoaded: true,
        userEmail: settings.user.email,
        telemetryEnabled: settings.telemetry.enabled,
        telemetryConsentDecided: settings.telemetry.consentDecided,
        telemetryAnonymousId: settings.telemetry.anonymousId,
        defaultExplorerView: settings.explorer.defaultView,
        activityBarPosition: settings.layout.activityBarPosition,
        sidebarPosition: settings.layout.sidebarPosition,
        showActivityBarLabels: settings.layout.showActivityBarLabels,
        globalFont: settings.layout.globalFont,
        fontSize: settings.layout.fontSize,
        editorFontSize: settings.editor?.fontSize ?? 10,
        explorerSortField: settings.explorer.sortField,
        explorerSortDirection: settings.explorer.sortDirection,
        explorerShowHidden: settings.explorer.showHidden,
        explorerHideFolders: settings.explorer.hideFolders,
        explorerMixFoldersWithFiles: settings.explorer.mixFoldersWithFiles,
        explorerDimHiddenFiles: settings.explorer.dimHiddenFiles,
        explorerSingleClickOpen: settings.explorer.singleClickOpen,
        explorerShortcutVisibility:
          settings.explorer.shortcutVisibility ??
          EXPLORER_SHORTCUT_VISIBILITY_DEFAULTS,
        chatSystemPrompt: settings.chat.systemPrompt,
        chatModel: settings.chat.model,
        chatModelUserSet: settings.chat.modelUserSet ?? false,
        chatWidthPercent: settings.chat.widthPercent,
        dashboardLazyLoadTabs: settings.dashboard.lazyLoadTabs,
        snippetsTileWidth: settings.dashboard.snippetsTileWidth,
        liveSportsTileWidth: settings.dashboard.liveSportsTileWidth ?? "half",
        newsTileWidth: settings.dashboard.newsTileWidth ?? "full",
        stocksTileWidth: settings.dashboard.stocksTileWidth ?? "half",
        todaysAgendaTileWidth:
          settings.dashboard.todaysAgendaTileWidth ?? "half",
        currentlyReadingTileWidth:
          settings.dashboard.currentlyReadingTileWidth ?? "half",
        clipboardQuickAccessTileWidth:
          settings.dashboard.clipboardQuickAccessTileWidth ?? "third",
        quickPromptsTileWidth:
          settings.dashboard.quickPromptsTileWidth ?? "third",
        timerTileWidth: settings.dashboard.timerTileWidth ?? "small",
        keepAwakeTileWidth: settings.dashboard.keepAwakeTileWidth ?? "half",
        timeCalendarTileWidth:
          settings.dashboard.timeCalendarTileWidth ?? "half",
        emailsAttentionTileWidth:
          settings.dashboard.emailsAttentionTileWidth ?? "half",
        tileOrder: settings.dashboard.tileOrder,
        tileVisibility: settings.dashboard.tileVisibility ?? {},
        lastActiveApp: settings.lastActiveApp as AppView,
        restoreLastApp: settings.restoreLastApp,
        searchFuzzyEnabled: settings.searchFuzzyEnabled ?? false,
        keepAliveLimit: settings.keepAliveLimit ?? 3,
        enabledApps: backfilled.enabledApps,
        libraryReadingFont: settings.library.readingFont,
        libraryContentWidth: settings.library.contentWidth,
        libraryInlineImageSize: settings.library.inlineImageSize ?? "medium",
        libraryDefaultBookmarkView: settings.library.defaultBookmarkView,
        libraryDFHideSidebar: settings.library.dfHideSidebar,
        libraryDFHideRightPanel: settings.library.dfHideRightPanel,
        libraryDFHideActivityBar: settings.library.dfHideActivityBar,
        libraryDFHideHeader: settings.library.dfHideHeader,
        libraryDFHideBottomNav: settings.library.dfHideBottomNav,
        libraryDFShowHeaderOnHover: settings.library.dfShowHeaderOnHover,
        libraryCacheImagesForOffline:
          settings.library.cacheImagesForOffline ?? true,
        libraryDefaultLanguage: (settings.library.defaultLanguage ??
          "english") as Language,
        notesContentWidth: (settings.notes?.contentWidth ??
          "medium") as ContentWidth,
        messagesContentWidth: (settings.messages?.contentWidth ??
          "medium") as ContentWidth,
        notesShowLabels: settings.notes?.showLabels ?? true,
        notesMode: (settings.notes?.mode ?? "edit") as NotesMode,
        notesAutoScrollEnabled: settings.notes?.autoScrollEnabled ?? false,
        notesAutoScrollSpeed: settings.notes?.autoScrollSpeed ?? 1.0,
        notesAutoScrollMode: (settings.notes?.autoScrollMode ??
          "continuous") as NotesScrollMode,
        notesAutoScrollStepPixels: settings.notes?.autoScrollStepPixels ?? 300,
        notesAutoScrollStepIntervalMs:
          settings.notes?.autoScrollStepIntervalMs ?? 3000,
        clipboardMaxItems: settings.clipboard?.maxItems ?? 500,
        clipboardAddOnce: settings.clipboard?.addOnce ?? false,
        clipboardSyntaxHighlightCode:
          settings.clipboard?.syntaxHighlightCode ?? true,
        clipboardAutoDescribeImages:
          settings.clipboard?.autoDescribeImages ?? true,
        clipboardTimelineSortDirection: (settings.clipboard
          ?.timelineSortDirection ?? "desc") as ClipboardTimelineSortDirection,
        explainLanguage: settings.general.explainLanguage,
        recordNotifications: settings.general.recordNotifications,
        showScrollPercentage: settings.general.showScrollPercentage ?? true,
        showScrollProgressBar:
          settings.general.showScrollProgressBar ?? true,
        playChimeOnCompletion:
          settings.notifications?.playChimeOnCompletion ?? true,
        chimeSuccessSound: settings.notifications?.chimeSuccessSound ?? "chime",
        chimeErrorSound: settings.notifications?.chimeErrorSound ?? "soft-pop",
        securityEnabled: settings.security.enabled,
        securityType: settings.security.type,
        securityHash: settings.security.hash,
        securitySalt: settings.security.salt,
        securityLockTimeoutMinutes: settings.security.lockTimeoutMinutes,
        securityLockOnFocusLoss: settings.security.lockOnFocusLoss,
        fullscreenClockFace: (settings.clock?.fullscreenFace ??
          "minimal") as FullscreenClockFace,
        securityLockOnLaunch: settings.security.lockOnLaunch,
        securityMaxFailedAttempts: settings.security.maxFailedAttempts,
        securityPreventScreenCapture:
          settings.security.preventScreenCapture ?? false,
        fullscreenClockTimeoutMs: settings.clock?.fullscreenTimeoutMs ?? 3000,
        fullscreenClockPressAndHold:
          settings.clock?.fullscreenPressAndHold ?? false,
        devShowStoreInspector: settings.developer?.showStoreInspector ?? false,
        devShowDebugPanel: settings.developer?.showDebugPanel ?? false,
        devShowAIInspector: settings.developer?.showAIInspector ?? false,
        devShowDebugTools:
          settings.developer?.showDebugTools ??
          settings.developer?.showStoreInspector ??
          settings.developer?.showDebugPanel ??
          settings.developer?.showAIInspector ??
          false,
        apiClientSortField: settings.apiClient.sortField as ApiClientSortField,
        apiClientSortDirection: settings.apiClient
          .sortDirection as ApiClientSortDirection,
        terminalFontFamily: settings.terminal?.fontFamily ?? null,
        terminalFontSize: settings.terminal?.fontSize ?? 13,
        terminalLineHeight: settings.terminal?.lineHeight ?? 1.2,
        terminalLetterSpacing: settings.terminal?.letterSpacing ?? 0,
        terminalFontWeight: (settings.terminal?.fontWeight ??
          "normal") as CodeFontWeight,
        terminalFontLigatures: settings.terminal?.fontLigatures ?? false,
        terminalInsertPromptAutoRun:
          settings.terminal?.insertPromptAutoRun ?? false,
        terminalHistoryAutocomplete:
          settings.terminal?.historyAutocomplete ?? true,
        terminalGitPanelWidth: settings.terminal?.gitPanelWidth ?? 300,
        terminalDefaultThemeId: settings.terminal?.defaultThemeId ?? null,
        voiceModel: settings.voice?.model ?? "base",
        voiceLanguage: settings.voice?.language ?? "auto",
        voiceCommandsEnabled: settings.voice?.commandsEnabled ?? true,
        voiceContinuousDictation: settings.voice?.continuousDictation ?? true,
        voiceChunkDuration: settings.voice?.chunkDuration ?? 2,
        ttsModel: settings.tts?.model ?? "kokoro-en",
        ttsVoice: settings.tts?.voice ?? "af_heart",
        ttsSpeed: settings.tts?.speed ?? 1.0,
        dpWorkStartTime: settings.dailyPlan?.workStartTime ?? null,
        dpWorkEndTime: settings.dailyPlan?.workEndTime ?? null,
        dpLunchStartTime: settings.dailyPlan?.lunchStartTime ?? null,
        dpLunchEndTime: settings.dailyPlan?.lunchEndTime ?? null,
        dpStatusTemplate: settings.dailyPlan?.statusTemplate ?? null,
        autoThemeEnabled: settings.autoTheme?.enabled ?? false,
        autoThemePauseOnManualChange:
          settings.autoTheme?.pauseOnManualChange ?? true,
        autoThemeRanges: settings.autoTheme?.ranges ?? [],
        dndEnabled: settings.dnd?.enabled ?? DND_DEFAULTS.enabled,
        dndRanges: settings.dnd?.ranges ?? DND_DEFAULTS.ranges,
        hasCompletedOnboarding: settings.onboarding?.completed ?? false,
        aiDefaultMode: settings.aiAssistant?.defaultMode ?? "ask",
        aiAppModes: settings.aiAssistant?.appModes ?? {},
        panelAIConfigs: settings.aiAssistant?.panelConfigs ?? {},
      });
      applyGlobalFont(settings.layout.globalFont);
      applyFontSize(settings.layout.fontSize);
      // Pick the best available AI model as the global default, unless the
      // user has explicitly chosen one. Fire-and-forget — never blocks boot.
      void resolveDefaultModelAction({
        isUserSet: get().chatModelUserSet,
        currentModel: get().chatModel,
        applyModel: (model) => {
          set({ chatModel: model });
          patchAppData((d) => {
            d.settings.chat.model = model;
          });
        },
        setAvailableModelIds: get().setAvailableModelIds,
        panelAIConfigs: get().panelAIConfigs,
        setPanelAIConfig: get().setPanelAIConfig,
      });
      // Each window protects itself on boot when the setting is enabled.
      void applyContentProtectionCurrent(
        settings.security.preventScreenCapture ?? false,
      );
    },

    setUserEmail: (email) => {
      if (get().userEmail === email) return;
      set({ userEmail: email });
      patchAppData((d) => {
        d.settings.user.email = email;
      });
    },

    setTelemetryEnabled: (enabled) => {
      if (get().telemetryEnabled === enabled) return;
      set({ telemetryEnabled: enabled });
      patchAppData((d) => {
        d.settings.telemetry.enabled = enabled;
        d.settings.telemetry.consentDecided = true;
        d.settings.telemetry.consentedAt = new Date().toISOString();
      });
      set({ telemetryConsentDecided: true });
    },

    setTelemetryConsentDecided: (decided) => {
      if (get().telemetryConsentDecided === decided) return;
      set({ telemetryConsentDecided: decided });
      patchAppData((d) => {
        d.settings.telemetry.consentDecided = decided;
      });
    },

    ensureTelemetryAnonymousId: () => {
      const existing = get().telemetryAnonymousId;
      if (existing) return existing;
      const id = crypto.randomUUID();
      set({ telemetryAnonymousId: id });
      patchAppData((d) => {
        d.settings.telemetry.anonymousId = id;
      });
      return id;
    },

    setDefaultExplorerView: (mode) => {
      if (get().defaultExplorerView === mode) return;
      set({ defaultExplorerView: mode });
      patchAppData((d) => {
        d.settings.explorer.defaultView = mode;
      });
    },

    setActivityBarPosition: (position) => {
      if (get().activityBarPosition === position) return;
      set({ activityBarPosition: position });
      patchAppData((d) => {
        d.settings.layout.activityBarPosition = position;
      });
    },

    setSidebarPosition: (position) => {
      if (get().sidebarPosition === position) return;
      set({ sidebarPosition: position });
      patchAppData((d) => {
        d.settings.layout.sidebarPosition = position;
      });
    },

    setShowActivityBarLabels: (show) => {
      if (get().showActivityBarLabels === show) return;
      set({ showActivityBarLabels: show });
      patchAppData((d) => {
        d.settings.layout.showActivityBarLabels = show;
      });
    },

    // Ephemeral toggle (intentionally NOT persisted via patchAppData): the
    // Activity Bar is always visible on relaunch.
    setActivityBarHidden: (hidden) => {
      if (get().activityBarHidden === hidden) return;
      set({ activityBarHidden: hidden });
    },

    toggleActivityBar: () => {
      set({ activityBarHidden: !get().activityBarHidden });
    },

    setGlobalFont: (font) => {
      if (get().globalFont === font) return;
      set({ globalFont: font });
      applyGlobalFont(font);
      patchAppData((d) => {
        d.settings.layout.globalFont = font;
      });
    },

    setFontSize: (size) => {
      if (get().fontSize === size) return;
      set({ fontSize: size });
      applyFontSize(size);
      patchAppData((d) => {
        d.settings.layout.fontSize = size;
      });
    },

    setEditorFontSize: (size) => {
      if (get().editorFontSize === size) return;
      set({ editorFontSize: size });
      patchAppData((d) => {
        if (!d.settings.editor) d.settings.editor = { fontSize: size };
        else d.settings.editor.fontSize = size;
      });
    },

    setExplorerSortField: (field) => {
      if (get().explorerSortField === field) return;
      set({ explorerSortField: field });
      patchAppData((d) => {
        d.settings.explorer.sortField = field;
      });
    },

    setExplorerSortDirection: (direction) => {
      if (get().explorerSortDirection === direction) return;
      set({ explorerSortDirection: direction });
      patchAppData((d) => {
        d.settings.explorer.sortDirection = direction;
      });
    },

    setExplorerShowHidden: (show) => {
      if (get().explorerShowHidden === show) return;
      set({ explorerShowHidden: show });
      patchAppData((d) => {
        d.settings.explorer.showHidden = show;
      });
    },

    setExplorerHideFolders: (hide) => {
      if (get().explorerHideFolders === hide) return;
      set({ explorerHideFolders: hide });
      patchAppData((d) => {
        d.settings.explorer.hideFolders = hide;
      });
    },

    setExplorerMixFoldersWithFiles: (mix) => {
      if (get().explorerMixFoldersWithFiles === mix) return;
      set({ explorerMixFoldersWithFiles: mix });
      patchAppData((d) => {
        d.settings.explorer.mixFoldersWithFiles = mix;
      });
    },

    setExplorerDimHiddenFiles: (dim) => {
      if (get().explorerDimHiddenFiles === dim) return;
      set({ explorerDimHiddenFiles: dim });
      patchAppData((d) => {
        d.settings.explorer.dimHiddenFiles = dim;
      });
    },

    setExplorerSingleClickOpen: (single) => {
      if (get().explorerSingleClickOpen === single) return;
      set({ explorerSingleClickOpen: single });
      patchAppData((d) => {
        d.settings.explorer.singleClickOpen = single;
      });
    },

    setExplorerShortcutVisibility: (key, visible) => {
      const current = get().explorerShortcutVisibility;
      if (current[key] === visible) return;
      const next: ExplorerShortcutVisibility = { ...current, [key]: visible };
      set({ explorerShortcutVisibility: next });
      patchAppData((d) => {
        d.settings.explorer.shortcutVisibility = next;
      });
    },

    setChatSystemPrompt: (prompt) => {
      if (get().chatSystemPrompt === prompt) return;
      set({ chatSystemPrompt: prompt });
      patchAppData((d) => {
        d.settings.chat.systemPrompt = prompt;
      });
    },

    setChatModel: (model) => {
      if (get().chatModel === model) return;
      set({ chatModel: model, chatModelUserSet: true });
      patchAppData((d) => {
        d.settings.chat.model = model;
        d.settings.chat.modelUserSet = true;
      });
    },

    reconcileModels: () => {
      void resolveDefaultModelAction({
        isUserSet: get().chatModelUserSet,
        currentModel: get().chatModel,
        applyModel: (model) => {
          set({ chatModel: model });
          patchAppData((d) => {
            d.settings.chat.model = model;
          });
        },
        setAvailableModelIds: get().setAvailableModelIds,
        panelAIConfigs: get().panelAIConfigs,
        setPanelAIConfig: get().setPanelAIConfig,
      });
    },

    setAvailableModelIds: (ids) => {
      const current = get().availableModelIds;
      if (
        current.length === ids.length &&
        current.every((id, i) => id === ids[i])
      ) {
        return;
      }
      // In-memory only — never persisted; refreshed from the live API each boot.
      set({ availableModelIds: ids });
    },

    setChatWidthPercent: (percent) => {
      if (get().chatWidthPercent === percent) return;
      set({ chatWidthPercent: percent });
      patchAppData((d) => {
        d.settings.chat.widthPercent = percent;
      });
    },

    setDashboardLazyLoadTabs: (enabled) => {
      if (get().dashboardLazyLoadTabs === enabled) return;
      set({ dashboardLazyLoadTabs: enabled });
      patchAppData((d) => {
        d.settings.dashboard.lazyLoadTabs = enabled;
      });
    },

    setSnippetsTileWidth: (width) => {
      if (get().snippetsTileWidth === width) return;
      set({ snippetsTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.snippetsTileWidth = width;
      });
    },

    setLiveSportsTileWidth: (width) => {
      if (get().liveSportsTileWidth === width) return;
      set({ liveSportsTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.liveSportsTileWidth = width;
      });
    },

    setNewsTileWidth: (width) => {
      if (get().newsTileWidth === width) return;
      set({ newsTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.newsTileWidth = width;
      });
    },

    setStocksTileWidth: (width) => {
      if (get().stocksTileWidth === width) return;
      set({ stocksTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.stocksTileWidth = width;
      });
    },

    setTodaysAgendaTileWidth: (width) => {
      if (get().todaysAgendaTileWidth === width) return;
      set({ todaysAgendaTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.todaysAgendaTileWidth = width;
      });
    },

    setCurrentlyReadingTileWidth: (width) => {
      if (get().currentlyReadingTileWidth === width) return;
      set({ currentlyReadingTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.currentlyReadingTileWidth = width;
      });
    },

    setClipboardQuickAccessTileWidth: (width) => {
      if (get().clipboardQuickAccessTileWidth === width) return;
      set({ clipboardQuickAccessTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.clipboardQuickAccessTileWidth = width;
      });
    },

    setQuickPromptsTileWidth: (width) => {
      if (get().quickPromptsTileWidth === width) return;
      set({ quickPromptsTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.quickPromptsTileWidth = width;
      });
    },

    setTimerTileWidth: (width) => {
      if (get().timerTileWidth === width) return;
      set({ timerTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.timerTileWidth = width;
      });
    },

    setKeepAwakeTileWidth: (width) => {
      if (get().keepAwakeTileWidth === width) return;
      set({ keepAwakeTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.keepAwakeTileWidth = width;
      });
    },

    setTimeCalendarTileWidth: (width) => {
      if (get().timeCalendarTileWidth === width) return;
      set({ timeCalendarTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.timeCalendarTileWidth = width;
      });
    },

    setEmailsAttentionTileWidth: (width) => {
      if (get().emailsAttentionTileWidth === width) return;
      set({ emailsAttentionTileWidth: width });
      patchAppData((d) => {
        d.settings.dashboard.emailsAttentionTileWidth = width;
      });
    },

    setDashboardClockUse24Hour: (enabled) => {
      if (get().dashboardClockUse24Hour === enabled) return;
      set({ dashboardClockUse24Hour: enabled });
      patchAppData((d) => {
        d.settings.dashboard.dashboardClockUse24Hour = enabled;
      });
    },

    setTileOrder: (order) => {
      if (get().tileOrder === order) return;
      set({ tileOrder: order });
      patchAppData((d) => {
        d.settings.dashboard.tileOrder = order;
      });
    },

    setTileVisibility: (tileId, visible) => {
      const current = get().tileVisibility;
      if (current[tileId] === visible) return;
      const next = { ...current, [tileId]: visible };
      set({ tileVisibility: next });
      patchAppData((d) => {
        d.settings.dashboard.tileVisibility = next;
      });
    },

    setLastActiveApp: (mode) => {
      if (get().lastActiveApp === mode) return;
      set({ lastActiveApp: mode });
      patchAppData((d) => {
        d.settings.lastActiveApp = mode;
      });
    },

    setRestoreLastApp: (enabled) => {
      if (get().restoreLastApp === enabled) return;
      set({ restoreLastApp: enabled });
      patchAppData((d) => {
        d.settings.restoreLastApp = enabled;
      });
    },

    setSearchFuzzyEnabled: (enabled) => {
      if (get().searchFuzzyEnabled === enabled) return;
      set({ searchFuzzyEnabled: enabled });
      patchAppData((d) => {
        d.settings.searchFuzzyEnabled = enabled;
      });
    },

    setKeepAliveLimit: (limit) => {
      const next = setKeepAliveLimitAction(get().keepAliveLimit, limit);
      if (next === null) return;
      set({ keepAliveLimit: next });
    },

    setEnabledApps: (apps) => {
      const next = setEnabledAppsAction(get().enabledApps, apps);
      if (next === null) return;
      set({ enabledApps: next });
    },

    toggleAppEnabled: (app) => {
      const next = toggleAppEnabledAction(get().enabledApps, app);
      if (next === null) return;
      set({ enabledApps: next });
    },

    isAppEnabled: (app) => get().enabledApps.includes(app),

    setLibraryReadingFont: (font) => {
      if (get().libraryReadingFont === font) return;
      set({ libraryReadingFont: font });
      patchAppData((d) => {
        d.settings.library.readingFont = font;
      });
    },

    setLibraryContentWidth: (width) => {
      if (get().libraryContentWidth === width) return;
      set({ libraryContentWidth: width });
      patchAppData((d) => {
        d.settings.library.contentWidth = width;
      });
    },

    setLibraryInlineImageSize: (size) => {
      if (get().libraryInlineImageSize === size) return;
      set({ libraryInlineImageSize: size });
      patchAppData((d) => {
        d.settings.library.inlineImageSize = size;
      });
    },

    setLibraryDefaultBookmarkView: (mode) => {
      if (get().libraryDefaultBookmarkView === mode) return;
      set({ libraryDefaultBookmarkView: mode });
      patchAppData((d) => {
        d.settings.library.defaultBookmarkView = mode;
      });
    },

    setLibraryDFHideSidebar: (hide) => {
      if (get().libraryDFHideSidebar === hide) return;
      set({ libraryDFHideSidebar: hide });
      patchAppData((d) => {
        d.settings.library.dfHideSidebar = hide;
      });
    },

    setLibraryDFHideRightPanel: (hide) => {
      if (get().libraryDFHideRightPanel === hide) return;
      set({ libraryDFHideRightPanel: hide });
      patchAppData((d) => {
        d.settings.library.dfHideRightPanel = hide;
      });
    },

    setLibraryDFHideActivityBar: (hide) => {
      if (get().libraryDFHideActivityBar === hide) return;
      set({ libraryDFHideActivityBar: hide });
      patchAppData((d) => {
        d.settings.library.dfHideActivityBar = hide;
      });
    },

    setLibraryDFHideHeader: (hide) => {
      if (get().libraryDFHideHeader === hide) return;
      set({ libraryDFHideHeader: hide });
      patchAppData((d) => {
        d.settings.library.dfHideHeader = hide;
      });
    },

    setLibraryDFHideBottomNav: (hide) => {
      if (get().libraryDFHideBottomNav === hide) return;
      set({ libraryDFHideBottomNav: hide });
      patchAppData((d) => {
        d.settings.library.dfHideBottomNav = hide;
      });
    },

    setLibraryDFShowHeaderOnHover: (show) => {
      if (get().libraryDFShowHeaderOnHover === show) return;
      set({ libraryDFShowHeaderOnHover: show });
      patchAppData((d) => {
        d.settings.library.dfShowHeaderOnHover = show;
      });
    },

    setLibraryCacheImagesForOffline: (enabled) => {
      if (get().libraryCacheImagesForOffline === enabled) return;
      set({ libraryCacheImagesForOffline: enabled });
      patchAppData((d) => {
        d.settings.library.cacheImagesForOffline = enabled;
      });
    },

    setLibraryDefaultLanguage: (lang) => {
      if (get().libraryDefaultLanguage === lang) return;
      set({ libraryDefaultLanguage: lang });
      patchAppData((d) => {
        d.settings.library.defaultLanguage = lang;
      });
    },

    setNotesContentWidth: (width) => {
      if (get().notesContentWidth === width) return;
      set({ notesContentWidth: width });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
          };
        d.settings.notes.contentWidth = width;
      });
    },

    setMessagesContentWidth: (width) => {
      if (get().messagesContentWidth === width) return;
      set({ messagesContentWidth: width });
      patchAppData((d) => {
        if (!d.settings.messages) d.settings.messages = { contentWidth: width };
        else d.settings.messages.contentWidth = width;
      });
    },

    setNotesShowLabels: (show) => {
      if (get().notesShowLabels === show) return;
      set({ notesShowLabels: show });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
          };
        d.settings.notes.showLabels = show;
      });
    },

    setNotesMode: (mode) => {
      if (get().notesMode === mode) return;
      set({ notesMode: mode });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
            autoScrollEnabled: false,
            autoScrollSpeed: 1.0,
          };
        d.settings.notes.mode = mode;
      });
    },

    setNotesAutoScrollEnabled: (enabled) => {
      if (get().notesAutoScrollEnabled === enabled) return;
      set({ notesAutoScrollEnabled: enabled });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
            autoScrollEnabled: false,
            autoScrollSpeed: 1.0,
          };
        d.settings.notes.autoScrollEnabled = enabled;
      });
    },

    setNotesAutoScrollSpeed: (speed) => {
      if (get().notesAutoScrollSpeed === speed) return;
      set({ notesAutoScrollSpeed: speed });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
            autoScrollEnabled: false,
            autoScrollSpeed: 1.0,
          };
        d.settings.notes.autoScrollSpeed = speed;
      });
    },

    setNotesAutoScrollMode: (mode) => {
      if (get().notesAutoScrollMode === mode) return;
      set({ notesAutoScrollMode: mode });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
            autoScrollEnabled: false,
            autoScrollSpeed: 1.0,
          };
        d.settings.notes.autoScrollMode = mode;
      });
    },

    setNotesAutoScrollStepPixels: (pixels) => {
      if (get().notesAutoScrollStepPixels === pixels) return;
      set({ notesAutoScrollStepPixels: pixels });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
            autoScrollEnabled: false,
            autoScrollSpeed: 1.0,
          };
        d.settings.notes.autoScrollStepPixels = pixels;
      });
    },

    setNotesAutoScrollStepIntervalMs: (intervalMs) => {
      if (get().notesAutoScrollStepIntervalMs === intervalMs) return;
      set({ notesAutoScrollStepIntervalMs: intervalMs });
      patchAppData((d) => {
        if (!d.settings.notes)
          d.settings.notes = {
            contentWidth: "medium",
            showLabels: true,
            mode: "edit",
            autoScrollEnabled: false,
            autoScrollSpeed: 1.0,
          };
        d.settings.notes.autoScrollStepIntervalMs = intervalMs;
      });
    },

    setClipboardAutoDescribeImages: (enabled) => {
      if (get().clipboardAutoDescribeImages === enabled) return;
      set({ clipboardAutoDescribeImages: enabled });
      patchAppData((d) => {
        if (!d.settings.clipboard)
          d.settings.clipboard = {
            autoDescribeImages: true,
            maxItems: 500,
            addOnce: false,
            syntaxHighlightCode: true,
            timelineSortDirection: "desc",
          };
        d.settings.clipboard.autoDescribeImages = enabled;
      });
    },

    setClipboardMaxItems: (count) => {
      if (get().clipboardMaxItems === count) return;
      set({ clipboardMaxItems: count });
      patchAppData((d) => {
        if (!d.settings.clipboard)
          d.settings.clipboard = {
            autoDescribeImages: true,
            maxItems: 500,
            addOnce: false,
            syntaxHighlightCode: true,
            timelineSortDirection: "desc",
          };
        d.settings.clipboard.maxItems = count;
      });
      window.api?.setClipboardMaxItems?.(count);
    },

    setClipboardAddOnce: (enabled) => {
      if (get().clipboardAddOnce === enabled) return;
      set({ clipboardAddOnce: enabled });
      patchAppData((d) => {
        if (!d.settings.clipboard)
          d.settings.clipboard = {
            autoDescribeImages: true,
            maxItems: 500,
            addOnce: false,
            syntaxHighlightCode: true,
            timelineSortDirection: "desc",
          };
        d.settings.clipboard.addOnce = enabled;
      });
      window.api?.setClipboardAddOnce?.(enabled);
    },

    setClipboardSyntaxHighlightCode: (enabled) => {
      if (get().clipboardSyntaxHighlightCode === enabled) return;
      set({ clipboardSyntaxHighlightCode: enabled });
      patchAppData((d) => {
        if (!d.settings.clipboard)
          d.settings.clipboard = {
            autoDescribeImages: true,
            maxItems: 500,
            addOnce: false,
            syntaxHighlightCode: true,
            timelineSortDirection: "desc",
          };
        d.settings.clipboard.syntaxHighlightCode = enabled;
      });
    },

    setClipboardTimelineSortDirection: (direction) => {
      if (get().clipboardTimelineSortDirection === direction) return;
      set({ clipboardTimelineSortDirection: direction });
      patchAppData((d) => {
        if (!d.settings.clipboard)
          d.settings.clipboard = {
            autoDescribeImages: true,
            maxItems: 500,
            addOnce: false,
            syntaxHighlightCode: true,
            timelineSortDirection: "desc",
          };
        d.settings.clipboard.timelineSortDirection = direction;
      });
    },

    setExplainLanguage: (lang) => {
      if (get().explainLanguage === lang) return;
      set({ explainLanguage: lang });
      patchAppData((d) => {
        d.settings.general.explainLanguage = lang;
      });
    },

    setRecordNotifications: (enabled) => {
      if (get().recordNotifications === enabled) return;
      set({ recordNotifications: enabled });
      patchAppData((d) => {
        d.settings.general.recordNotifications = enabled;
      });
    },

    setShowScrollPercentage: (enabled) => {
      if (get().showScrollPercentage === enabled) return;
      set({ showScrollPercentage: enabled });
      patchAppData((d) => {
        d.settings.general.showScrollPercentage = enabled;
      });
    },

    setShowScrollProgressBar: (enabled) => {
      if (get().showScrollProgressBar === enabled) return;
      set({ showScrollProgressBar: enabled });
      patchAppData((d) => {
        d.settings.general.showScrollProgressBar = enabled;
      });
    },

    setPlayChimeOnCompletion: (enabled) => {
      if (get().playChimeOnCompletion === enabled) return;
      set({ playChimeOnCompletion: enabled });
      patchAppData((d) => {
        if (!d.settings.notifications) {
          d.settings.notifications = {
            playChimeOnCompletion: enabled,
            chimeSuccessSound: "chime",
            chimeErrorSound: "soft-pop",
          };
          return;
        }
        d.settings.notifications.playChimeOnCompletion = enabled;
      });
    },

    setChimeSuccessSound: (soundId) => {
      if (get().chimeSuccessSound === soundId) return;
      set({ chimeSuccessSound: soundId });
      patchAppData((d) => {
        if (!d.settings.notifications) {
          d.settings.notifications = {
            playChimeOnCompletion: true,
            chimeSuccessSound: soundId,
            chimeErrorSound: "soft-pop",
          };
          return;
        }
        d.settings.notifications.chimeSuccessSound = soundId;
      });
    },

    setChimeErrorSound: (soundId) => {
      if (get().chimeErrorSound === soundId) return;
      set({ chimeErrorSound: soundId });
      patchAppData((d) => {
        if (!d.settings.notifications) {
          d.settings.notifications = {
            playChimeOnCompletion: true,
            chimeSuccessSound: "chime",
            chimeErrorSound: soundId,
          };
          return;
        }
        d.settings.notifications.chimeErrorSound = soundId;
      });
    },

    setSecurityEnabled: (enabled) => {
      if (get().securityEnabled === enabled) return;
      set({ securityEnabled: enabled });
      patchAppData((d) => {
        d.settings.security.enabled = enabled;
      });
    },

    setSecurityType: (type) => {
      if (get().securityType === type) return;
      set({ securityType: type });
      patchAppData((d) => {
        d.settings.security.type = type;
      });
    },

    setSecurityCredentials: (hash, salt) => {
      set({ securityHash: hash, securitySalt: salt });
      patchAppData((d) => {
        d.settings.security.hash = hash;
        d.settings.security.salt = salt;
      });
    },

    setSecurityLockTimeoutMinutes: (minutes) => {
      if (get().securityLockTimeoutMinutes === minutes) return;
      set({ securityLockTimeoutMinutes: minutes });
      patchAppData((d) => {
        d.settings.security.lockTimeoutMinutes = minutes;
      });
    },

    setSecurityLockOnFocusLoss: (enabled) => {
      if (get().securityLockOnFocusLoss === enabled) return;
      set({ securityLockOnFocusLoss: enabled });
      patchAppData((d) => {
        d.settings.security.lockOnFocusLoss = enabled;
      });
    },

    setSecurityLockOnLaunch: (enabled) => {
      if (get().securityLockOnLaunch === enabled) return;
      set({ securityLockOnLaunch: enabled });
      patchAppData((d) => {
        d.settings.security.lockOnLaunch = enabled;
      });
    },

    setSecurityMaxFailedAttempts: (attempts) => {
      if (get().securityMaxFailedAttempts === attempts) return;
      set({ securityMaxFailedAttempts: attempts });
      patchAppData((d) => {
        d.settings.security.maxFailedAttempts = attempts;
      });
    },

    setSecurityPreventScreenCapture: (enabled) => {
      if (get().securityPreventScreenCapture === enabled) return;
      set({ securityPreventScreenCapture: enabled });
      patchAppData((d) => {
        d.settings.security.preventScreenCapture = enabled;
      });
      // Propagate to every open window immediately (no restart needed).
      void applyContentProtectionAll(enabled);
    },

    setFullscreenClockTimeoutMs: (ms) => {
      // `0` is a sentinel for "infinite" (no auto-dismiss). Any other value
      // is clamped to a safe range so the timer is always meaningful.
      const rounded = Math.round(ms);
      const clamped =
        rounded === 0 ? 0 : Math.max(500, Math.min(60000, rounded));
      if (get().fullscreenClockTimeoutMs === clamped) return;
      set({ fullscreenClockTimeoutMs: clamped });
      patchAppData((d) => {
        if (!d.settings.clock)
          d.settings.clock = { fullscreenTimeoutMs: clamped };
        else d.settings.clock.fullscreenTimeoutMs = clamped;
      });
    },

    setFullscreenClockFace: (face) => {
      if (get().fullscreenClockFace === face) return;
      set({ fullscreenClockFace: face });
      patchAppData((d) => {
        if (!d.settings.clock)
          d.settings.clock = {
            fullscreenTimeoutMs: 3000,
            fullscreenFace: face,
          };
        else d.settings.clock.fullscreenFace = face;
      });
    },

    setFullscreenClockPressAndHold: (enabled) => {
      if (get().fullscreenClockPressAndHold === enabled) return;
      set({ fullscreenClockPressAndHold: enabled });
      patchAppData((d) => {
        if (!d.settings.clock)
          d.settings.clock = {
            fullscreenTimeoutMs: 3000,
            fullscreenPressAndHold: enabled,
          };
        else d.settings.clock.fullscreenPressAndHold = enabled;
      });
    },

    setDevShowStoreInspector: (show) => {
      if (get().devShowStoreInspector === show) return;
      set({ devShowStoreInspector: show });
      patchAppData((d) => {
        if (!d.settings.developer)
          d.settings.developer = {
            showStoreInspector: false,
            showDebugPanel: false,
            showAIInspector: false,
          };
        d.settings.developer.showStoreInspector = show;
      });
    },

    setDevShowDebugPanel: (show) => {
      if (get().devShowDebugPanel === show) return;
      set({ devShowDebugPanel: show });
      patchAppData((d) => {
        if (!d.settings.developer)
          d.settings.developer = {
            showStoreInspector: false,
            showDebugPanel: false,
            showAIInspector: false,
          };
        d.settings.developer.showDebugPanel = show;
      });
    },

    setDevShowAIInspector: (show) => {
      if (get().devShowAIInspector === show) return;
      set({ devShowAIInspector: show });
      patchAppData((d) => {
        if (!d.settings.developer)
          d.settings.developer = {
            showStoreInspector: false,
            showDebugPanel: false,
            showAIInspector: false,
          };
        d.settings.developer.showAIInspector = show;
      });
    },

    setDevShowDebugTools: (show) => {
      if (get().devShowDebugTools === show) return;
      set({ devShowDebugTools: show });
      patchAppData((d) => {
        if (!d.settings.developer)
          d.settings.developer = {
            showStoreInspector: false,
            showDebugPanel: false,
            showAIInspector: false,
          };
        (d.settings.developer as any).showDebugTools = show;
      });
    },

    setApiClientSortField: (field) => {
      if (get().apiClientSortField === field) return;
      set({ apiClientSortField: field });
      patchAppData((d) => {
        d.settings.apiClient.sortField = field;
      });
    },

    setApiClientSortDirection: (direction) => {
      if (get().apiClientSortDirection === direction) return;
      set({ apiClientSortDirection: direction });
      patchAppData((d) => {
        d.settings.apiClient.sortDirection = direction;
      });
    },

    setVoiceModel: (model) => {
      if (get().voiceModel === model) return;
      set({ voiceModel: model });
      patchAppData((d) => {
        if (!d.settings.voice)
          d.settings.voice = {
            model: "base",
            language: "auto",
            commandsEnabled: true,
            continuousDictation: true,
            chunkDuration: 2,
          };
        d.settings.voice.model = model;
      });
    },

    setVoiceLanguage: (language) => {
      if (get().voiceLanguage === language) return;
      set({ voiceLanguage: language });
      patchAppData((d) => {
        if (!d.settings.voice)
          d.settings.voice = {
            model: "base",
            language: "auto",
            commandsEnabled: true,
            continuousDictation: true,
            chunkDuration: 2,
          };
        d.settings.voice.language = language;
      });
    },

    setVoiceCommandsEnabled: (enabled) => {
      if (get().voiceCommandsEnabled === enabled) return;
      set({ voiceCommandsEnabled: enabled });
      patchAppData((d) => {
        if (!d.settings.voice)
          d.settings.voice = {
            model: "base",
            language: "auto",
            commandsEnabled: true,
            continuousDictation: true,
            chunkDuration: 2,
          };
        d.settings.voice.commandsEnabled = enabled;
      });
    },

    setVoiceContinuousDictation: (enabled) => {
      if (get().voiceContinuousDictation === enabled) return;
      set({ voiceContinuousDictation: enabled });
      patchAppData((d) => {
        if (!d.settings.voice)
          d.settings.voice = {
            model: "base",
            language: "auto",
            commandsEnabled: true,
            continuousDictation: true,
            chunkDuration: 2,
          };
        d.settings.voice.continuousDictation = enabled;
      });
    },

    setVoiceChunkDuration: (duration) => {
      if (get().voiceChunkDuration === duration) return;
      set({ voiceChunkDuration: duration });
      patchAppData((d) => {
        if (!d.settings.voice)
          d.settings.voice = {
            model: "base",
            language: "auto",
            commandsEnabled: true,
            continuousDictation: true,
            chunkDuration: 2,
          };
        d.settings.voice.chunkDuration = duration;
      });
    },

    setTtsModel: (model) => {
      if (get().ttsModel === model) return;
      set({ ttsModel: model });
      patchAppData((d) => {
        if (!d.settings.tts)
          d.settings.tts = {
            model: "kokoro-en",
            voice: "af_heart",
            speed: 1.0,
          };
        d.settings.tts.model = model;
      });
    },

    setTtsVoice: (voice) => {
      if (get().ttsVoice === voice) return;
      set({ ttsVoice: voice });
      patchAppData((d) => {
        if (!d.settings.tts)
          d.settings.tts = {
            model: "kokoro-en",
            voice: "af_heart",
            speed: 1.0,
          };
        d.settings.tts.voice = voice;
      });
    },

    setTtsSpeed: (speed) => {
      if (get().ttsSpeed === speed) return;
      set({ ttsSpeed: speed });
      patchAppData((d) => {
        if (!d.settings.tts)
          d.settings.tts = {
            model: "kokoro-en",
            voice: "af_heart",
            speed: 1.0,
          };
        d.settings.tts.speed = speed;
      });
    },

    setDpWorkHours: (data) => {
      set({
        dpWorkStartTime: data.workStartTime,
        dpWorkEndTime: data.workEndTime,
        dpLunchStartTime: data.lunchStartTime,
        dpLunchEndTime: data.lunchEndTime,
      });
      patchAppData((d) => {
        if (!d.settings.dailyPlan)
          d.settings.dailyPlan = {
            workStartTime: null,
            workEndTime: null,
            lunchStartTime: null,
            lunchEndTime: null,
            statusTemplate: null,
          };
        d.settings.dailyPlan.workStartTime = data.workStartTime;
        d.settings.dailyPlan.workEndTime = data.workEndTime;
        d.settings.dailyPlan.lunchStartTime = data.lunchStartTime;
        d.settings.dailyPlan.lunchEndTime = data.lunchEndTime;
      });
    },

    clearDpWorkHours: () => {
      set({ dpWorkStartTime: null, dpWorkEndTime: null });
      patchAppData((d) => {
        if (!d.settings.dailyPlan)
          d.settings.dailyPlan = {
            workStartTime: null,
            workEndTime: null,
            lunchStartTime: null,
            lunchEndTime: null,
            statusTemplate: null,
          };
        d.settings.dailyPlan.workStartTime = null;
        d.settings.dailyPlan.workEndTime = null;
      });
    },

    clearDpLunchHours: () => {
      set({ dpLunchStartTime: null, dpLunchEndTime: null });
      patchAppData((d) => {
        if (!d.settings.dailyPlan)
          d.settings.dailyPlan = {
            workStartTime: null,
            workEndTime: null,
            lunchStartTime: null,
            lunchEndTime: null,
            statusTemplate: null,
          };
        d.settings.dailyPlan.lunchStartTime = null;
        d.settings.dailyPlan.lunchEndTime = null;
      });
    },

    setDpStatusTemplate: (template) => {
      if (get().dpStatusTemplate === template) return;
      set({ dpStatusTemplate: template });
      patchAppData((d) => {
        if (!d.settings.dailyPlan)
          d.settings.dailyPlan = {
            workStartTime: null,
            workEndTime: null,
            lunchStartTime: null,
            lunchEndTime: null,
            statusTemplate: null,
          };
        d.settings.dailyPlan.statusTemplate = template;
      });
    },

    setAutoThemeEnabled: (enabled) => {
      if (get().autoThemeEnabled === enabled) return;
      set({ autoThemeEnabled: enabled });
      patchAppData((d) => {
        if (!d.settings.autoTheme)
          d.settings.autoTheme = {
            enabled: false,
            pauseOnManualChange: true,
            ranges: [],
          };
        d.settings.autoTheme.enabled = enabled;
      });
    },

    setAutoThemePauseOnManualChange: (enabled) => {
      if (get().autoThemePauseOnManualChange === enabled) return;
      set({ autoThemePauseOnManualChange: enabled });
      patchAppData((d) => {
        if (!d.settings.autoTheme)
          d.settings.autoTheme = {
            enabled: false,
            pauseOnManualChange: true,
            ranges: [],
          };
        d.settings.autoTheme.pauseOnManualChange = enabled;
      });
    },

    setAutoThemeRanges: (ranges) => {
      set({ autoThemeRanges: ranges });
      patchAppData((d) => {
        if (!d.settings.autoTheme)
          d.settings.autoTheme = {
            enabled: false,
            pauseOnManualChange: true,
            ranges: [],
          };
        d.settings.autoTheme.ranges = ranges;
      });
    },

    setDndEnabled: (enabled) => {
      if (get().dndEnabled === enabled) return;
      set({ dndEnabled: enabled });
      patchAppData((d) => {
        if (!d.settings.dnd) d.settings.dnd = { enabled: false, ranges: [] };
        d.settings.dnd.enabled = enabled;
      });
    },

    setDndRanges: (ranges) => {
      set({ dndRanges: ranges });
      patchAppData((d) => {
        if (!d.settings.dnd) d.settings.dnd = { enabled: false, ranges: [] };
        d.settings.dnd.ranges = ranges;
      });
    },

    setHasCompletedOnboarding: (completed) => {
      if (get().hasCompletedOnboarding === completed) return;
      set({ hasCompletedOnboarding: completed });
      patchAppData((d) => {
        if (!d.settings.onboarding)
          d.settings.onboarding = { completed: false };
        d.settings.onboarding.completed = completed;
      });
    },

    setAiDefaultMode: (mode) => {
      if (get().aiDefaultMode === mode) return;
      set({ aiDefaultMode: mode });
      patchAppData((d) => {
        d.settings.aiAssistant.defaultMode = mode;
      });
    },

    setAiAppMode: (appId, mode) => {
      const current = get().aiAppModes[appId];
      if (current === mode) return;
      const updated = { ...get().aiAppModes };
      if (mode === undefined) {
        delete updated[appId];
      } else {
        updated[appId] = mode;
      }
      set({ aiAppModes: updated });
      patchAppData((d) => {
        d.settings.aiAssistant.appModes = updated;
      });
    },

    getAiModeForApp: (appId) => {
      const { aiAppModes, aiDefaultMode } = get();
      return aiAppModes[appId] ?? aiDefaultMode;
    },

    getPanelAIConfig: (appId) => {
      const partial = get().panelAIConfigs[appId] ?? {};
      return { ...DEFAULT_PANEL_AI_CONFIG, ...partial };
    },

    setPanelAIConfig: (appId, config) => {
      const current = get().panelAIConfigs[appId] ?? {};
      const merged = { ...current, ...config };
      const updated = { ...get().panelAIConfigs, [appId]: merged };
      set({ panelAIConfigs: updated });
      patchAppData((d) => {
        d.settings.aiAssistant.panelConfigs = updated;
      });
    },

    setTerminalFontFamily: (family) => {
      if (get().terminalFontFamily === family) return;
      set({ terminalFontFamily: family });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.fontFamily = family;
      });
    },
    setTerminalFontSize: (size) => {
      if (get().terminalFontSize === size) return;
      set({ terminalFontSize: size });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.fontSize = size;
      });
    },
    setTerminalLineHeight: (value) => {
      if (get().terminalLineHeight === value) return;
      set({ terminalLineHeight: value });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.lineHeight = value;
      });
    },
    setTerminalLetterSpacing: (value) => {
      if (get().terminalLetterSpacing === value) return;
      set({ terminalLetterSpacing: value });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.letterSpacing = value;
      });
    },
    setTerminalFontWeight: (weight) => {
      if (get().terminalFontWeight === weight) return;
      set({ terminalFontWeight: weight });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.fontWeight = weight;
      });
    },
    setTerminalFontLigatures: (enabled) => {
      if (get().terminalFontLigatures === enabled) return;
      set({ terminalFontLigatures: enabled });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.fontLigatures = enabled;
      });
    },
    setTerminalInsertPromptAutoRun: (enabled) => {
      if (get().terminalInsertPromptAutoRun === enabled) return;
      set({ terminalInsertPromptAutoRun: enabled });
      patchAppData((d) => {
        if (d.settings.terminal)
          d.settings.terminal.insertPromptAutoRun = enabled;
      });
    },
    setTerminalHistoryAutocomplete: (enabled) => {
      if (get().terminalHistoryAutocomplete === enabled) return;
      set({ terminalHistoryAutocomplete: enabled });
      patchAppData((d) => {
        if (d.settings.terminal)
          d.settings.terminal.historyAutocomplete = enabled;
      });
    },
    setTerminalGitPanelWidth: (width) => {
      if (get().terminalGitPanelWidth === width) return;
      set({ terminalGitPanelWidth: width });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.gitPanelWidth = width;
      });
    },
    setTerminalDefaultThemeId: (id) => {
      if (get().terminalDefaultThemeId === id) return;
      set({ terminalDefaultThemeId: id });
      patchAppData((d) => {
        if (d.settings.terminal) d.settings.terminal.defaultThemeId = id;
      });
    },
  }),
);
