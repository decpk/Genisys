import {
  BookOpen,
  BotMessageSquare,
  CalendarCheck,
  ClipboardPaste,
  LayoutDashboard,
  Link,
  MessagesSquare,
  NotebookPen,
  Presentation,
  Send,
  Server,
  Share2,
  Sparkles,
  SquareTerminal,
  Store,
  Timer,
  Webcam,
  Workflow,
} from "lucide-react";

import { ExplorerIcon } from "@/components/ExplorerIcon";

import type { AppView } from "./ActivityBar.types";

export interface AppItem {
  mode: Exclude<AppView, "settings">;
  icon: React.ComponentType<{ size: number; strokeWidth?: number }>;
  label: string;
  tooltip?: string;
  shortcutId: string;
}

/**
 * Canonical list of switchable apps with their icons, labels, and per-app
 * shortcut ids. Shared by the ActivityBar and the AppSwitcher HUD so both
 * surfaces stay in sync.
 *
 * NOTE: `settings` is intentionally excluded — it has its own button in
 * the ActivityBar footer and is not part of normal app switching.
 */
export const APP_ITEMS: ReadonlyArray<AppItem> = [
  {
    mode: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    shortcutId: "global.switchApp.dashboard",
  },
  {
    mode: "dailyplan",
    icon: CalendarCheck,
    label: "Daily Plan",
    shortcutId: "global.switchApp.dailyplan",
  },
  {
    mode: "timer",
    icon: Timer,
    label: "Timer",
    shortcutId: "global.switchApp.timer",
  },
  {
    mode: "notes",
    icon: NotebookPen,
    label: "Notes",
    shortcutId: "global.switchApp.notes",
  },
  {
    mode: "library",
    icon: BookOpen,
    label: "Library",
    shortcutId: "global.switchApp.library",
  },
  {
    mode: "explorer",
    icon: ExplorerIcon,
    label: "Explorer",
    shortcutId: "global.switchApp.explorer",
  },
  {
    mode: "prompts",
    icon: Sparkles,
    label: "Prompts",
    tooltip: "Prompts \u2014 organize and reuse your AI prompts",
    shortcutId: "global.switchApp.prompts",
  },
  {
    mode: "chat",
    icon: BotMessageSquare,
    label: "Chat",
    shortcutId: "global.switchApp.chat",
  },
  {
    mode: "messages",
    icon: MessagesSquare,
    label: "Messages",
    tooltip: "Messages \u2014 private peer-to-peer, end-to-end encrypted",
    shortcutId: "global.switchApp.messages",
  },
  {
    mode: "apiclient",
    icon: Send,
    label: "API Client",
    shortcutId: "global.switchApp.apiclient",
  },
  {
    mode: "weblinks",
    icon: Link,
    label: "WebLinks",
    tooltip: "WebLinks — save, organize & open any link",
    shortcutId: "global.switchApp.weblinks",
  },
  {
    mode: "mockserver",
    icon: Server,
    label: "Mock Server",
    shortcutId: "global.switchApp.mockserver",
  },
  {
    mode: "clipboard",
    icon: ClipboardPaste,
    label: "Clipboard",
    shortcutId: "global.switchApp.clipboard",
  },
  {
    mode: "terminal",
    icon: SquareTerminal,
    label: "Terminal",
    tooltip: "Terminal — multi-tab shell with split panes",
    shortcutId: "global.switchApp.terminal",
  },
  {
    mode: "monitor",
    icon: Webcam,
    label: "Monitor",
    tooltip: "Monitor — stream this device's camera & mic to a device on your Wi-Fi",
    shortcutId: "global.switchApp.monitor",
  },
  {
    mode: "quickshare",
    icon: Share2,
    label: "QuickShare",
    tooltip: "QuickShare — send & receive files and text with any device via a QR code",
    shortcutId: "global.switchApp.quickshare",
  },
  {
    mode: "autoflow",
    icon: Workflow,
    label: "Autoflow",
    shortcutId: "global.switchApp.autoflow",
  },
  {
    mode: "webpoint",
    icon: Presentation,
    label: "WebPoint",
    tooltip: "WebPoint — AI presentations",
    shortcutId: "global.switchApp.webpoint",
  },
  {
    mode: "appstore",
    icon: Store,
    label: "App Store",
    tooltip: "App Store",
    shortcutId: "global.switchApp.appstore",
  },
];

/**
 * Lookup the AppItem metadata for a given AppView. Returns `undefined`
 * for views that aren't switchable (e.g. `settings`, `debug`).
 */
export function findAppItem(mode: AppView): AppItem | undefined {
  return APP_ITEMS.find((item) => item.mode === mode);
}
