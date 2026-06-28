import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { clampStepPixels } from '../utils/clampStepPixels';
import { clampStepIntervalMs } from '../utils/clampStepIntervalMs';

/**
 * Sub-hook: Manages stepped-scroll configuration — the pixel distance per
 * step and the wait interval between steps. Controlled by the stepped-mode
 * sliders.
 */
export function useAutoScrollStep() {
  const stepPixels = useSettingsStore((s) => s.notesAutoScrollStepPixels);
  const stepIntervalMs = useSettingsStore((s) => s.notesAutoScrollStepIntervalMs);
  const setNotesAutoScrollStepPixels = useSettingsStore((s) => s.setNotesAutoScrollStepPixels);
  const setNotesAutoScrollStepIntervalMs = useSettingsStore((s) => s.setNotesAutoScrollStepIntervalMs);

  const setStepPixels = useCallback(
    (pixels: number) => {
      setNotesAutoScrollStepPixels(clampStepPixels(pixels));
    },
    [setNotesAutoScrollStepPixels]
  );

  const setStepIntervalMs = useCallback(
    (intervalMs: number) => {
      setNotesAutoScrollStepIntervalMs(clampStepIntervalMs(intervalMs));
    },
    [setNotesAutoScrollStepIntervalMs]
  );

  return {
    stepPixels,
    stepIntervalMs,
    setStepPixels,
    setStepIntervalMs,
  };
}
