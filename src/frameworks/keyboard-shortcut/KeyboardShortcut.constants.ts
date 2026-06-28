import {
  APICLIENT_ACTIONS_SHORTCUTS,
  CHAT_ACTIONS_SHORTCUTS,
  CLIPBOARD_ACTIONS_SHORTCUTS,
  CLOCK_ACTIONS_SHORTCUTS,
  DAILYPLAN_ACTIONS_SHORTCUTS,
  LIBRARY_ACTIONS_SHORTCUTS,
  MOCKSERVER_ACTIONS_SHORTCUTS,
  NOTES_ACTIONS_SHORTCUTS,
  PROMPTS_ACTIONS_SHORTCUTS,
  SECURITY_ACTIONS_SHORTCUTS,
  TERMINAL_ACTIONS_SHORTCUTS,
  TIMER_ACTIONS_SHORTCUTS,
  TOGGLE_RIGHT_PANEL_SHORTCUTS,
  TOGGLE_SIDEBAR_SHORTCUTS,
  TOGGLE_ACTIVITY_BAR_SHORTCUTS,
} from "@/keyboard-shortcut-impl";

import type { ShortcutDef } from "./KeyboardShortcut.types";

// ── Platform detection ───────────────────────────────────────────────

export const IS_MAC = navigator.platform.toUpperCase().includes("MAC");

// ── Modifier order for normalization ─────────────────────────────────

export const MODIFIER_ORDER = ["mod", "ctrl", "alt", "shift"] as const;

// ── Chord timing ─────────────────────────────────────────────────────

/** Time window (ms) to wait for the second key of a chord shortcut. */
export const CHORD_TIMEOUT_MS = 1500;

// ── Global shortcuts ─────────────────────────────────────────────────

export const GLOBAL_SHORTCUTS: ShortcutDef[] = [
  {
    id: "global.zoomIn",
    label: "Zoom In",
    description: "Increase the zoom level",
    scope: "global",
    defaultKeys: "Mod+=",
    category: "View",
  },
  {
    id: "global.zoomOut",
    label: "Zoom Out",
    description: "Decrease the zoom level",
    scope: "global",
    defaultKeys: "Mod+-",
    category: "View",
  },
  {
    id: "global.zoomReset",
    label: "Reset Zoom",
    description: "Reset zoom to default level",
    scope: "global",
    defaultKeys: "Mod+0",
    category: "View",
  },
  {
    id: "global.toggleWindowFullScreen",
    label: "Toggle Window Full Screen",
    description: "Toggle the entire app window full screen",
    scope: "global",
    defaultKeys: "Mod+Ctrl+F",
    category: "View",
  },
  {
    id: "global.quitApp",
    label: "Quit Genisys",
    description: "Show the quit confirmation dialog before exiting Genisys",
    scope: "global",
    defaultKeys: "Mod+Q",
    category: "General",
    allowInInput: true,
  },
  {
    id: "global.settings.toggleDrawer",
    label: "Toggle Settings Drawer",
    description:
      "Toggle the in-app Settings side panel without leaving the current app",
    scope: "global",
    defaultKeys: "Mod+,",
    category: "General",
    allowInInput: true,
  },
  {
    id: "global.settings.openFullApp",
    label: "Open Settings",
    description: "Open the full Settings app",
    scope: "global",
    defaultKeys: "Mod+Shift+,",
    category: "General",
    allowInInput: true,
  },
  {
    id: "global.commandPalette.quickOpen",
    label: "Quick Open",
    description:
      "Quickly jump to any note, book, request, conversation, or other item",
    scope: "global",
    defaultKeys: "Mod+P",
    category: "General",
    allowInInput: true,
  },
  {
    id: "global.commandPalette.commands",
    label: "Show Command Palette",
    description: "Show all runnable commands",
    scope: "global",
    defaultKeys: "Mod+Shift+P",
    category: "General",
    allowInInput: true,
  },
  {
    id: "global.switchApp.dashboard",
    label: "Switch to Dashboard",
    description: "Navigate to the Dashboard overview",
    scope: "global",
    defaultKeys: "Mod+1",
    category: "Navigation",
  },
  {
    id: "global.switchApp.dailyplan",
    label: "Switch to Daily Plan",
    description: "Navigate to the Daily Plan",
    scope: "global",
    defaultKeys: "Mod+2",
    category: "Navigation",
  },
  {
    id: "global.switchApp.notes",
    label: "Switch to Notes",
    description: "Navigate to the Notes app",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.library",
    label: "Switch to Library",
    description: "Navigate to the Library",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.explorer",
    label: "Switch to Explorer",
    description: "Navigate to the file Explorer",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.chat",
    label: "Switch to Chat",
    description: "Navigate to the Chat interface",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.messages",
    label: "Switch to Messages",
    description: "Navigate to Messages — private peer-to-peer messaging",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.apiclient",
    label: "Switch to API Client",
    description: "Navigate to the API Client",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.weblinks",
    label: "Switch to WebLinks",
    description: "Navigate to WebLinks",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.mockserver",
    label: "Switch to Mock Server",
    description: "Navigate to the Mock Server",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.terminal",
    label: "Switch to Terminal",
    description: "Navigate to the Terminal app",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.monitor",
    label: "Switch to Monitor",
    description: "Navigate to the Monitor app",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.quickshare",
    label: "Switch to QuickShare",
    description: "Navigate to the QuickShare app",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.autoflow",
    label: "Switch to Autoflow",
    description: "Navigate to Autoflow workflows",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.webpoint",
    label: "Switch to WebPoint",
    description: "Navigate to WebPoint presentations",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.clipboard",
    label: "Switch to Clipboard",
    description: "Navigate to the Clipboard Manager",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.timer",
    label: "Switch to Timer",
    description: "Navigate to the Timer app",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.prompts",
    label: "Switch to Prompts",
    description: "Navigate to the Prompts library",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.switchApp.appstore",
    label: "Switch to App Store",
    description: "Open the App Store to enable or disable apps",
    scope: "global",
    defaultKeys: "",
    category: "Navigation",
  },
  {
    id: "global.appSwitcher.next",
    label: "App Switcher — Next",
    description:
      "Open the app switcher HUD and highlight the next app. Release Ctrl to commit, Escape to cancel.",
    scope: "global",
    // NOTE: keep this on a literal `Ctrl` combo — its release modifier is
    // Control on every platform, which is what commits the HUD (see
    // useAppSwitcherHotkeys). Do NOT use Cmd/Mod here: `Mod+\`` resolves to ⌘+`
    // on macOS, the reserved system "cycle app windows" shortcut, swallowed by
    // the OS before the web view sees it. `Ctrl+Tab` is reserved for
    // terminal-tab switching and `Ctrl+\`` is taken by *.toggleTerminal, so the
    // app switcher uses `Ctrl+]` / `Ctrl+[`.
    defaultKeys: "Ctrl+]",
    category: "Navigation",
    allowInInput: true,
  },
  {
    id: "global.appSwitcher.prev",
    label: "App Switcher — Previous",
    description:
      "Open the app switcher HUD and highlight the previous app. Release Ctrl to commit, Escape to cancel.",
    scope: "global",
    defaultKeys: "Ctrl+[",
    category: "Navigation",
    allowInInput: true,
  },
  {
    id: "global.appSwitcher.closeAll",
    label: "Close All Apps",
    description:
      "Close (deactivate) every open app at once. Dashboard stays as the always-on fallback.",
    scope: "global",
    defaultKeys: "Mod+Ctrl+Alt+Q",
    category: "Navigation",
    allowInInput: true,
  },
];

// ── All default shortcut definitions ─────────────────────────────────
// App-specific shortcuts will be imported here from per-app manifest files.
// For now, start with global shortcuts only. Apps will add their own via:
//   import { LIBRARY_SHORTCUTS } from '@/components/Library/Library.shortcuts'
//   ALL_SHORTCUT_DEFS.push(...LIBRARY_SHORTCUTS)

export const ALL_SHORTCUT_DEFS: ShortcutDef[] = [
  ...GLOBAL_SHORTCUTS,
  ...TOGGLE_SIDEBAR_SHORTCUTS,
  ...TOGGLE_RIGHT_PANEL_SHORTCUTS,
  ...TOGGLE_ACTIVITY_BAR_SHORTCUTS,
  ...LIBRARY_ACTIONS_SHORTCUTS,
  ...NOTES_ACTIONS_SHORTCUTS,
  ...APICLIENT_ACTIONS_SHORTCUTS,
  ...CHAT_ACTIONS_SHORTCUTS,
  ...CLIPBOARD_ACTIONS_SHORTCUTS,
  ...CLOCK_ACTIONS_SHORTCUTS,
  ...DAILYPLAN_ACTIONS_SHORTCUTS,
  ...TIMER_ACTIONS_SHORTCUTS,
  ...TERMINAL_ACTIONS_SHORTCUTS,
  ...MOCKSERVER_ACTIONS_SHORTCUTS,
  ...PROMPTS_ACTIONS_SHORTCUTS,
  ...SECURITY_ACTIONS_SHORTCUTS,
];
