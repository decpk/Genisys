import type { TimerCustomPreset } from "@/store/timer-store/timer-store.types";

import type { TimerPreset } from "../constants/timerPresets";

import { resolvePresetIcon } from "./resolvePresetIcon";

/**
 * Maps a serializable `TimerCustomPreset` into the existing `TimerPreset`
 * render shape (with a resolved `LucideIcon`), so custom presets can flow
 * through the same row + hover-card components used by built-ins.
 */
export function customPresetToTimerPreset(custom: TimerCustomPreset): TimerPreset {
  return {
    id: custom.id,
    label: custom.label,
    mode: custom.mode,
    durationSec: custom.durationSec,
    breakSec: custom.breakSec,
    icon: resolvePresetIcon(custom.iconKey),
    iconKey: custom.iconKey,
    tagline: custom.tagline,
    description: custom.description,
    bestFor: custom.bestFor,
  };
}
