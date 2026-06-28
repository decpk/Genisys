import { useEffect, useRef } from "react";

import { useSettingsStore } from "@/store/settings-store";
import { useThemeStore } from "@/store/theme-store";
import { findThemeById } from "@/themes/utils/findThemeById";
import { findActiveRange } from "./utils/findActiveRange";
import { getCurrentTimeMinutes } from "./utils/getCurrentTimeMinutes";

const SCHEDULER_INTERVAL_MS = 60_000;

export function useAutoThemeScheduler(): void {
  const enabled = useSettingsStore((s) => s.autoThemeEnabled);
  const ranges = useSettingsStore((s) => s.autoThemeRanges);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || ranges.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    function evaluate(): void {
      const currentMinutes = getCurrentTimeMinutes();
      const activeRange = findActiveRange(ranges, currentMinutes);
      if (!activeRange) return;

      const currentThemeId = useThemeStore.getState().activeThemeId;
      if (activeRange.themeId === currentThemeId) return;

      const themeExists = findThemeById(activeRange.themeId) !== undefined;
      if (!themeExists) return;

      useThemeStore.getState().setTheme(activeRange.themeId, "scheduler");
    }

    evaluate();

    intervalRef.current = setInterval(evaluate, SCHEDULER_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, ranges]);
}
