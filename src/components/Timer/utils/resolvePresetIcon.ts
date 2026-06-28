import type { LucideIcon } from "lucide-react";

import { DEFAULT_PRESET_ICON_KEY, PRESET_ICONS } from "../constants/timerPresetIcons";

/**
 * Resolves a serializable icon key to its Lucide component. Falls back to
 * the default icon when the key is missing or unknown.
 */
export function resolvePresetIcon(key: string | undefined): LucideIcon {
  const lookupKey = key ?? DEFAULT_PRESET_ICON_KEY;
  const match = PRESET_ICONS.find((e) => e.key === lookupKey);
  if (match) return match.component;
  const fallback = PRESET_ICONS.find((e) => e.key === DEFAULT_PRESET_ICON_KEY);
  // PRESET_ICONS always contains the default; this final fallback is only
  // a safety net for the type system.
  if (fallback) return fallback.component;
  return PRESET_ICONS[0].component;
}
