import type { ShortcutDef } from "@/frameworks/keyboard-shortcut/KeyboardShortcut.types";

export const PROMPTS_ACTIONS_SHORTCUTS: ShortcutDef[] = [
  {
    id: "prompts.closeTab",
    label: "Close Active Tab",
    description:
      "Close the currently open prompt tab. Has no effect on the Browse tab.",
    scope: "prompts",
    defaultKeys: "Mod+W",
    category: "Prompts / Tabs",
    allowInInput: true,
  },
];
