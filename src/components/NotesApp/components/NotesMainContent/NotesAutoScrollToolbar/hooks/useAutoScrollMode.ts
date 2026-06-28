import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settings-store';
import type { ScrollMode } from '../NotesAutoScrollToolbar.types';

/**
 * Sub-hook: Manages the auto-scroll behaviour mode (continuous vs stepped).
 * Controlled by the segmented mode toggle.
 */
export function useAutoScrollMode() {
  const notesAutoScrollMode = useSettingsStore((s) => s.notesAutoScrollMode);
  const setNotesAutoScrollMode = useSettingsStore((s) => s.setNotesAutoScrollMode);

  const setMode = useCallback(
    (mode: ScrollMode) => {
      setNotesAutoScrollMode(mode);
    },
    [setNotesAutoScrollMode]
  );

  return {
    mode: notesAutoScrollMode as ScrollMode,
    setMode,
  };
}
