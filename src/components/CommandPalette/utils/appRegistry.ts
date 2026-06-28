import type { ComponentType } from "react";

import type { AppView } from "@/components/ActivityBar";
import { APP_ITEMS } from "@/components/ActivityBar/ActivityBar.items";

export interface AppRegistryEntry {
  mode: Exclude<AppView, "settings">;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  shortcutId: string;
  /** Optional secondary terms to boost fuzzy search. */
  keywords?: string[];
}

/**
 * Per-app fuzzy-search keywords keyed by `AppView`. Kept separate from
 * `APP_ITEMS` because they only matter to the Command Palette's search.
 * Apps without an entry here are still fully reachable — they just match on
 * their label alone.
 */
const APP_KEYWORDS: Partial<Record<Exclude<AppView, "settings">, string[]>> = {
  dashboard: ["home", "overview", "start", "main"],
  dailyplan: [
    "agenda",
    "today",
    "calendar",
    "schedule",
    "planner",
    "tasks",
    "todo",
    "meetings",
    "events",
    "dp",
  ],
  notes: ["notebook", "notepad", "writing", "memo", "journal", "docs"],
  library: ["books", "reading", "read", "chapters", "ebooks", "lib"],
  explorer: ["files", "folder", "directory", "finder", "browse", "tree", "fs"],
  terminal: [
    "terminal",
    "shell",
    "console",
    "bash",
    "zsh",
    "pty",
    "command line",
    "cli",
    "prompt",
  ],
  chat: [
    "ai",
    "assistant",
    "gpt",
    "claude",
    "conversation",
    "ask",
    "llm",
  ],
  messages: [
    "chat",
    "p2p",
    "peer",
    "private",
    "encrypted",
    "e2e",
    "dm",
    "direct message",
    "local",
    "lan",
  ],
  apiclient: [
    "rest",
    "http",
    "request",
    "postman",
    "curl",
    "endpoint",
    "fetch",
  ],
  weblinks: [
    "website",
    "preview",
    "url",
    "link",
    "bookmark",
    "screenshot",
    "web",
  ],
  mockserver: ["mock", "api", "stub", "fake", "fixture", "server", "backend"],
  clipboard: ["copy", "paste", "history", "snippets", "clip", "cb"],
  timer: ["pomodoro", "stopwatch", "countdown", "focus", "break", "work"],
  prompts: [
    "prompt",
    "prompts",
    "library",
    "template",
    "snippet",
    "ai",
    "folder",
    "category",
  ],
  autoflow: ["workflow", "automation", "flow", "pipeline", "agent"],
  webpoint: ["presentation", "slides", "deck", "slideshow", "webpoint", "ppt"],
  monitor: [
    "camera",
    "webcam",
    "mic",
    "microphone",
    "stream",
    "remote",
    "baby monitor",
    "security cam",
    "webrtc",
    "watch",
    "video",
  ],
  quickshare: [
    "share",
    "file",
    "files",
    "text",
    "drop",
    "airdrop",
    "transfer",
    "send",
    "receive",
    "qr",
    "lan",
    "wifi",
    "android",
    "ios",
    "phone",
    "device",
  ],
  appstore: [
    "store",
    "apps",
    "install",
    "enable",
    "disable",
    "marketplace",
    "catalog",
    "manage apps",
  ],
};

/**
 * Canonical list of top-level apps the Command Palette can navigate to.
 *
 * DERIVED from `APP_ITEMS` — the single source of truth shared with the
 * ActivityBar + AppSwitcher — so the palette can never drift out of sync.
 * Every app in the ActivityBar is automatically reachable from Quick Open
 * (⌘P) and the "Switch to …" commands (⌘⇧P); a newly added app shows up with
 * zero extra wiring here. Per-app search terms come from `APP_KEYWORDS`.
 */
export const APP_REGISTRY: ReadonlyArray<AppRegistryEntry> = APP_ITEMS.map(
  (item): AppRegistryEntry => ({
    mode: item.mode,
    label: item.label,
    // All app icons (lucide + ExplorerIcon) accept `size`/`className` at
    // runtime; `APP_ITEMS` just types them more narrowly for the ActivityBar.
    icon: item.icon as unknown as ComponentType<{
      size?: number;
      className?: string;
    }>,
    shortcutId: item.shortcutId,
    keywords: APP_KEYWORDS[item.mode],
  }),
);
