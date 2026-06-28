import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settings-store';

/**
 * Sub-hook: Manages auto-scroll running state (on/off)
 * Controlled by Play/Pause button.
 */
export function useAutoScrollRunning() {
  const notesAutoScrollEnabled = useSettingsStore((s) => s.notesAutoScrollEnabled);
  const setNotesAutoScrollEnabled = useSettingsStore((s) => s.setNotesAutoScrollEnabled);

  const toggleAutoScroll = useCallback(() => {
    setNotesAutoScrollEnabled(!notesAutoScrollEnabled);
  }, [notesAutoScrollEnabled, setNotesAutoScrollEnabled]);

  return {
    isRunning: notesAutoScrollEnabled,
    toggleAutoScroll,
  };
}
