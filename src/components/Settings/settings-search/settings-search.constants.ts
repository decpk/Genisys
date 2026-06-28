import type { ComponentType } from 'react'
import type { IFuseOptions } from 'fuse.js'

import { SECTION_META, SETTINGS_SECTIONS } from '../Settings.constants'
import type { SettingsSection } from '../Settings.types'

import type {
  SettingsSearchEntry,
  SettingsSearchIndexedEntry,
} from './settings-search.types'
import { normalizeSettingLabel } from './utils/normalizeSettingLabel'

/** Minimum query length before the search filter activates. */
export const SETTINGS_SEARCH_MIN_QUERY_LENGTH = 2

export const SETTINGS_SEARCH_FUSE_OPTIONS: IFuseOptions<SettingsSearchIndexedEntry> = {
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.4,
  minMatchCharLength: 2,
  keys: [
    { name: "label", weight: 0.6 },
    { name: "keywords", weight: 0.2 },
    { name: "sectionLabel", weight: 0.15 },
    { name: "description", weight: 0.1 },
  ],
}

const SECTION_LABEL_BY_KEY = {} as Record<SettingsSection, string>
const sectionIcons = {} as Record<SettingsSection, ComponentType<{ size: number }>>
for (const item of SETTINGS_SECTIONS) {
  SECTION_LABEL_BY_KEY[item.key] = item.label
  sectionIcons[item.key] = item.icon
}

/** section key -> activity icon, used to render result cards. */
export const SECTION_ICON_BY_KEY: Record<SettingsSection, ComponentType<{ size: number }>> =
  sectionIcons

function sectionLabelFor(section: SettingsSection): string {
  return SECTION_LABEL_BY_KEY[section] ?? SECTION_META[section].title
}

/**
 * Hand-authored search index. `setting` entries mirror the exact `label` of a
 * rendered `SettingRow`; `card` entries surface custom / full-page sections (or
 * notable custom widgets) as navigable result cards.
 *
 * Drift note: a new setting must be added here to be searchable. `SettingRow`
 * emits a dev-only warning when a rendered label is missing from this index.
 */
const RAW_SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  // ── User ──────────────────────────────────────────────────────────────
  { id: "user:email", section: "user", kind: "setting", label: "User email", description: "Your email address, used for display and attribution across the app." },
  { id: "user:zoom", section: "user", kind: "setting", label: "Zoom level", description: "Adjust the overall zoom level of the application (base: 16px). Use Cmd/Ctrl + and Cmd/Ctrl - as keyboard shortcuts." },
  { id: "user:font-size", section: "user", kind: "setting", label: "Font size", description: "Base font size for the entire application. All elements using rem units will scale accordingly. Range: 12–24px." },
  { id: "user:app-font", section: "user", kind: "setting", label: "App font", description: "Choose the default font family used across the entire application.", keywords: ["typeface", "font family"] },
  { id: "user:explain-language", section: "user", kind: "setting", label: "Explain language", description: "Language used when explaining selected text via the 'Explain This' feature." },
  { id: "user:restore-last-app", section: "user", kind: "setting", label: "Restore last opened app", description: "When enabled, the application will reopen the last active app (e.g. Explorer, Chat, Notes) on startup instead of always starting on Dashboard.", keywords: ["startup", "launch"] },
  { id: "user:keep-alive", section: "user", kind: "setting", label: "Apps kept in memory", description: "Controls how many recently-used apps stay mounted in the background for instant switching. A higher number keeps more apps instantly switchable but uses more memory; a lower number stays snappier when many apps are open.", keywords: ["keep alive", "background", "memory"] },
  { id: "user:scroll-progress", section: "user", kind: "setting", label: "Show scroll progress bar", description: "Display the thin scroll progress bar at the top of the content in Notes and the Library reader." },
  { id: "user:scroll-percentage", section: "user", kind: "setting", label: "Show scroll percentage", description: "Display the scroll percentage while scrolling in Notes and the Library reader." },
  { id: "user:delete-all-data", section: "user", kind: "setting", label: "Delete all data", description: "Permanently delete all application data including history, projects, chat conversations, prompts, snippets, and dashboard projects. This action cannot be undone.", keywords: ["danger", "wipe", "erase"] },
  { id: "user:reset-settings", section: "user", kind: "setting", label: "Reset all settings", description: "Reset all application settings to their default values. Your data (history, projects, conversations) will not be affected. The app will reload after resetting.", keywords: ["danger", "defaults"] },
  { id: "user:panel-layout-card", section: "user", kind: "card", label: "Panel layout order", description: "Customize the Activity Bar position, labels, and side panel layout.", keywords: ["panel layout", "activity bar", "sidebar", "layout"] },

  // ── Theme ─────────────────────────────────────────────────────────────
  { id: "theme:active", section: "theme", kind: "setting", label: "Active theme", description: "Pick a built-in theme or one of your custom themes. Custom themes appear under their own group when you create them.", keywords: ["color scheme", "dark", "light", "appearance"] },
  { id: "theme:custom-card", section: "theme", kind: "card", label: "Custom themes", description: "Create, edit, duplicate, and manage your own custom themes with a live preview.", keywords: ["custom theme", "theme editor", "create theme"] },

  // ── Clock ─────────────────────────────────────────────────────────────
  { id: "clock:auto-dismiss", section: "clock", kind: "setting", label: "Auto-Dismiss After", description: "How long the fullscreen clock stays visible before it fades away. Mouse movement resets the timer. Choose ∞ to keep it open until you dismiss it manually (Escape / Enter / Space)." },
  { id: "clock:press-hold", section: "clock", kind: "setting", label: "Press-and-Hold to Peek", description: "Show the fullscreen clock only while the shortcut is held. Releasing dismisses it. When off, the shortcut toggles the clock and it auto-dismisses." },
  { id: "clock:face", section: "clock", kind: "setting", label: "Clock Face", description: "Pick a visual style for the fullscreen clock." },

  // ── Security ──────────────────────────────────────────────────────────
  { id: "security:prevent-capture", section: "security", kind: "setting", label: "Prevent Screen Capture", description: "Hide all Genisys windows from screenshots, screen recordings, and screen sharing. Captured frames appear blank. Note: this cannot block a physical camera photographing your screen, and has no effect on Linux." },
  { id: "security:app-lock", section: "security", kind: "setting", label: "App Lock", description: "Protect your app with a password or PIN. When enabled, a lock screen will appear based on your configured triggers.", keywords: ["password", "pin", "lock"] },
  { id: "security:lock-type", section: "security", kind: "setting", label: "Lock Type", description: "Choose between a numeric PIN or an alphanumeric password." },
  { id: "security:change-password", section: "security", kind: "setting", label: "Change Password", description: "Update your current password. You'll need to enter your current one first.", keywords: ["change pin", "password", "pin"] },
  { id: "security:auto-lock-timeout", section: "security", kind: "setting", label: "Auto-lock Timeout", description: "Lock the app after a period of inactivity. Set to Never to only lock manually or on other triggers." },
  { id: "security:lock-focus-loss", section: "security", kind: "setting", label: "Lock on Window Focus Loss", description: "Automatically lock when you switch to another application or the window loses focus." },
  { id: "security:lock-on-launch", section: "security", kind: "setting", label: "Lock on App Launch", description: "Require your password or PIN every time the app starts." },
  { id: "security:max-attempts", section: "security", kind: "setting", label: "Max Failed Attempts", description: "Number of incorrect attempts before a 30-second lockout is triggered." },
  { id: "security:lock-now", section: "security", kind: "setting", label: "Lock Now", description: "Immediately lock the app and require your password or PIN to continue." },

  // ── Dashboard ─────────────────────────────────────────────────────────
  { id: "dashboard:default-tab", section: "dashboard", kind: "setting", label: "Default dashboard tab", description: "Controls which tab is selected by default in each project card on the Dashboard. Choose between viewing pull requests created by you or assigned to you." },
  { id: "dashboard:lazy-load", section: "dashboard", kind: "setting", label: "Lazy load dashboard tabs", description: "Only fetch pull requests for a tab when you click on it, instead of loading all tabs upfront. This reduces the number of API calls on startup and improves initial load time." },
  { id: "dashboard:ai-model", section: "dashboard", kind: "setting", label: "AI Insights Model", description: "Model used for dashboard AI insights (e.g. stock analysis). Falls back to the default AI model." },

  // ── Notes ─────────────────────────────────────────────────────────────
  { id: "notes:show-labels", section: "notes", kind: "setting", label: "Show labels", description: "Display label badges on notes in the editor view. Toggle with ⇧⌘L." },

  // ── Library ───────────────────────────────────────────────────────────
  { id: "library:reading-font", section: "library", kind: "setting", label: "Reading font", description: "Choose the default font family used when reading chapters in the Library." },
  { id: "library:content-width", section: "library", kind: "setting", label: "Content width", description: "Set the default content width for reading chapters in the Library." },
  { id: "library:inline-image-size", section: "library", kind: "setting", label: "Inline image size", description: "Set the default width for inline chapter images in the Library. Images remain clickable for full-screen viewing." },
  { id: "library:bookmark-view", section: "library", kind: "setting", label: "Default bookmark view", description: "Choose the default view mode for the bookmarks sidebar in the Library." },
  { id: "library:book-language", section: "library", kind: "setting", label: "Default book language", description: "Pre-selected language when creating a new book or generating chapters. You can still change it per book in the New Book dialog." },
  { id: "library:distraction-free", section: "library", kind: "setting", label: "Distraction-free mode", description: "Customize which elements hide when you enter distraction-free reading (⇧⌘F)." },

  // ── Clipboard ─────────────────────────────────────────────────────────
  { id: "clipboard:max-items", section: "clipboard", kind: "setting", label: "Maximum clipboard items", description: "Limit the number of items stored in the clipboard history. When the limit is reached, the oldest unpinned items are automatically removed (LRU). Pinned items are never evicted." },
  { id: "clipboard:dedupe", section: "clipboard", kind: "setting", label: "Deduplicate clipboard entries", description: "When enabled, copying content that already exists in your clipboard history will move the existing entry to the top instead of creating a duplicate. Labels, pins, and other metadata are preserved." },
  { id: "clipboard:auto-describe", section: "clipboard", kind: "setting", label: "Auto-describe images with AI", description: "Automatically generate a text description when an image is copied to the clipboard. This uses a vision model to analyze the image content, enabling natural language search across your clipboard images." },
  { id: "clipboard:image-model", section: "clipboard", kind: "setting", label: "Image analysis model", description: "Vision model used to describe and extract text from copied images. Must be a vision-capable model. Defaults to GPT-4.1." },
  { id: "clipboard:syntax-highlight", section: "clipboard", kind: "setting", label: "Syntax-highlight code snippets", description: "When a clipboard item contains code, render it with syntax highlighting in the list and preview. Plain text and sensitive/redacted content are unaffected." },
  { id: "clipboard:timeline-sort", section: "clipboard", kind: "setting", label: "Timeline sort order", description: "Controls the order of work sessions and items inside each session in the Clipboard Timeline. Recent first puts the newest activity at the top." },

  // ── Explorer ──────────────────────────────────────────────────────────
  { id: "explorer:default-view", section: "explorer", kind: "setting", label: "Default explorer view", description: "Controls the initial layout of the file explorer when browsing repository contents. Choose from list, grid, detailed, compact, or thumbnail views." },
  { id: "explorer:default-sort", section: "explorer", kind: "setting", label: "Default explorer sort", description: "Controls the initial sort field and direction when browsing repository contents in the Explorer." },
  { id: "explorer:show-hidden", section: "explorer", kind: "setting", label: "Show hidden files", description: "When enabled, hidden files and folders (names starting with a dot) are visible by default in the Explorer for local repositories." },
  { id: "explorer:hide-folders", section: "explorer", kind: "setting", label: "Hide folders", description: "When enabled, folders are hidden by default in the Explorer, showing only files. Useful for quickly browsing file contents without folder nesting." },
  { id: "explorer:mix-folders", section: "explorer", kind: "setting", label: "Mix folders with files", description: "When enabled, folders and files are sorted together using the current sort field. When disabled, folders always appear before files." },
  { id: "explorer:dim-hidden", section: "explorer", kind: "setting", label: "Dim hidden files", description: "When enabled, hidden files (names starting with a dot) are rendered with reduced opacity in the Explorer when Show hidden files is on." },
  { id: "explorer:single-click", section: "explorer", kind: "setting", label: "Single-click to open", description: "When enabled, a single click opens files and folders. When disabled (default), single click selects an item and double-click opens it — matching Finder and Windows Explorer." },
  { id: "explorer:shortcuts", section: "explorer", kind: "setting", label: "Sidebar shortcuts", description: "Choose which standard folders appear under Shortcuts at the top of the Explorer sidebar. Disabled folders are hidden from the list." },

  // ── Terminal ──────────────────────────────────────────────────────────
  { id: "terminal:theme", section: "terminal", kind: "setting", label: "Terminal theme", description: "Default color scheme for terminals in the Terminal app. A tab's own theme overrides this." },
  { id: "terminal:font-family", section: "terminal", kind: "setting", label: "Terminal font family", description: "Monospace font used by the integrated terminal." },
  { id: "terminal:font-size", section: "terminal", kind: "setting", label: "Terminal font size", description: "Font size used by the integrated terminal. Range: 10–24px." },
  { id: "terminal:line-height", section: "terminal", kind: "setting", label: "Terminal line height", description: "Vertical spacing multiplier for terminal rows. Range: 0.8–2.5." },
  { id: "terminal:letter-spacing", section: "terminal", kind: "setting", label: "Terminal letter spacing", description: "Extra horizontal spacing between characters in the terminal. Range: -2–4px." },
  { id: "terminal:font-weight", section: "terminal", kind: "setting", label: "Terminal font weight", description: "Stroke weight of terminal text. Bold weights improve legibility on high-DPI displays." },
  { id: "terminal:ligatures", section: "terminal", kind: "setting", label: "Terminal font ligatures", description: "Enable programming ligatures in the terminal when the selected font supports them. Disabled by default since many shells render ligatures unpredictably." },
  { id: "terminal:auto-run-prompts", section: "terminal", kind: "setting", label: "Auto-run inserted prompts", description: "When enabled, choosing a prompt from the terminal's Insert prompt menu runs it immediately by sending Enter. Disabled by default so you can review or edit the command before running it." },
  { id: "terminal:history-autocomplete", section: "terminal", kind: "setting", label: "History autocomplete", description: "As you type at the prompt, suggest matching past commands from your shell history as inline ghost text. Press → or End to accept, Ctrl+Space for a list of matches." },

  // ── Chat ──────────────────────────────────────────────────
  { id: "chat:message-width", section: "chat", kind: "setting", label: "Message width", description: "Controls the maximum width of messages in the chat panel. A higher percentage uses more horizontal space." },
  { id: "chat:mcp-card", section: "chat", kind: "card", label: "MCP servers", description: "Manage Model Context Protocol servers and tool presets for the Chat assistant.", keywords: ["mcp", "model context protocol", "tools", "server"] },

  // ── AI Assistant ──────────────────────────────────────────────────────
  { id: "aiAssistant:default-model", section: "aiAssistant", kind: "setting", label: "Default AI Model", description: "The AI model used across all apps unless a per-app override is set below." },
  { id: "aiAssistant:default-mode", section: "aiAssistant", kind: "setting", label: "Default AI mode", description: "The default mode for the AI assistant across all apps. Ask = read-only answers, Plan = planning only, Agent = autonomous actions." },
  { id: "aiAssistant:app-modes", section: "aiAssistant", kind: "setting", label: "Per-app AI mode overrides", description: "Override the default AI mode for individual apps. Apps without an override will use the default mode." },
  { id: "aiAssistant:panel-tools", section: "aiAssistant", kind: "setting", label: "Per-panel tool & model configuration", description: "Configure which AI model and tools each panel uses. Disable tools for panels that don't need them to avoid API limits." },

  // ── Voice Input ───────────────────────────────────────────────────────
  { id: "voice:model", section: "voice", kind: "setting", label: "Voice Model", description: "Select and manage Whisper speech recognition models. Larger models are more accurate but slower." },
  { id: "voice:language", section: "voice", kind: "setting", label: "Voice Language", description: "Language for speech recognition. Auto-detect works for most languages but selecting a specific language may improve accuracy." },
  { id: "voice:commands", section: "voice", kind: "setting", label: "Voice Commands", description: "Enable voice commands like 'send message', 'new line', 'clear', and 'stop listening' during dictation." },
  { id: "voice:continuous", section: "voice", kind: "setting", label: "Continuous Dictation", description: "Keep recording across pauses without stopping. When disabled, recording stops after a period of silence." },

  // ── Text-to-Speech ────────────────────────────────────────────────────
  { id: "tts:model", section: "tts", kind: "setting", label: "TTS Model", description: "Select and manage Kokoro text-to-speech models. Smaller models are faster but slightly lower quality." },
  { id: "tts:voice", section: "tts", kind: "setting", label: "TTS Voice", description: "Choose a voice for text-to-speech. 26 voices across 9 languages available." },
  { id: "tts:speed", section: "tts", kind: "setting", label: "TTS Speed", description: "Playback speed for text-to-speech. 1x is normal speed." },

  // ── Card-only sections ────────────────────────────────────────────────
  { id: "card:dailyPlan", section: "dailyPlan", kind: "card", label: "Daily Plan", description: "Default work hours and lunch break settings.", keywords: ["work hours", "lunch break", "schedule"] },
  { id: "card:keyboard", section: "keyboard", kind: "card", label: "Keyboard Shortcuts", description: "View and customize keyboard shortcuts for all apps.", keywords: ["shortcut", "hotkey", "keybinding", "keys"] },
  { id: "card:notifications", section: "notifications", kind: "card", label: "Notifications", description: "Manage notification preferences and view notification history.", keywords: ["notification", "alerts", "chime", "sound", "quiet hours", "do not disturb", "dnd", "completion"] },
  { id: "card:usage", section: "usage", kind: "card", label: "Usage", description: "See how much time you spend in Genisys and each app.", keywords: ["time", "stats", "analytics", "activity"] },
  { id: "card:privacy", section: "privacy", kind: "card", label: "Privacy", description: "Control anonymous usage analytics and data sharing.", keywords: ["analytics", "telemetry", "data"] },
  { id: "card:about", section: "about", kind: "card", label: "About", description: "Application information.", keywords: ["version", "credits", "info"] },
]

const DEV_SETTINGS_SEARCH_INDEX: SettingsSearchEntry[] = [
  { id: "developer:devtools", section: "developer", kind: "setting", label: "DevTools", description: "Show the DevTools icon in the activity bar. Provides API Inspector, DB Explorer, Store Inspector, and AI Network Inspector in a unified panel." },
]

const ACTIVE_RAW_INDEX: SettingsSearchEntry[] = import.meta.env.DEV
  ? [...RAW_SETTINGS_SEARCH_INDEX, ...DEV_SETTINGS_SEARCH_INDEX]
  : RAW_SETTINGS_SEARCH_INDEX

export const SETTINGS_SEARCH_INDEX: SettingsSearchIndexedEntry[] = ACTIVE_RAW_INDEX.map(
  (entry) => ({ ...entry, sectionLabel: sectionLabelFor(entry.section) }),
)

/** Normalized labels of every indexed `setting` entry (for drift detection). */
export const SETTINGS_SEARCH_ALL_LABELS: ReadonlySet<string> = new Set(
  ACTIVE_RAW_INDEX.filter((entry) => entry.kind === "setting").map((entry) =>
    normalizeSettingLabel(entry.label),
  ),
)
