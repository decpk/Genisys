import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import { clampSpeedMultiplier } from '../utils/speedConversion';
import type { SpeedMultiplier } from '../NotesAutoScrollToolbar.types';

/**
 * Sub-hook: Manages auto-scroll speed multiplier (0.5x–3x).
 * Controlled by speed slider.
 */
export function useAutoScrollSpeed() {
  const notesAutoScrollSpeed = useSettingsStore((s) => s.notesAutoScrollSpeed);
  const setNotesAutoScrollSpeed = useSettingsStore((s) => s.setNotesAutoScrollSpeed);

  const setSpeed = useCallback(
    (speed: SpeedMultiplier) => {
      const clamped = clampSpeedMultiplier(speed);
      setNotesAutoScrollSpeed(clamped);
    },
    [setNotesAutoScrollSpeed]
  );

  return {
    speed: notesAutoScrollSpeed as SpeedMultiplier,
    setSpeed,
  };
}
