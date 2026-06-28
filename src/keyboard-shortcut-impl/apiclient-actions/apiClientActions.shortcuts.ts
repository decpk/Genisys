import type { ShortcutDef } from "@/frameworks/keyboard-shortcut/KeyboardShortcut.types";

export const APICLIENT_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: "apiclient.sendRequest",
    label: "Send Request",
    description: "Send the active API request",
    scope: "apiclient",
    defaultKeys: "Mod+Enter",
    category: "API Client",
    allowInInput: true,
  },
  {
    id: "apiclient.closeTab",
    label: "Close Tab",
    description: "Close the active request tab",
    scope: "apiclient",
    defaultKeys: "Mod+W",
    category: "API Client",
    allowInInput: true,
  },
];
