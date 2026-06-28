import { useCallback } from 'react';
import { useAutoScrollRunning } from './useAutoScrollRunning';
import { useAutoScrollSpeed } from './useAutoScrollSpeed';
import { useAutoScrollMode } from './useAutoScrollMode';
import { useAutoScrollStep } from './useAutoScrollStep';
import { clampSpeedMultiplier } from '../utils/speedConversion';
import type { UseNotesAutoScrollDataReturn } from '../NotesAutoScrollToolbar.types';
import type { SpeedMultiplier } from '../NotesAutoScrollToolbar.types';

/**
 * Orchestrator hook: Manages all Notes auto-scroll state and actions.
 * Composes individual sub-hooks (running + speed + mode + step config).
 * Used by NotesAutoScrollToolbar component.
 */
export function useNotesAutoScrollData(): UseNotesAutoScrollDataReturn {
  const { isRunning, toggleAutoScroll } = useAutoScrollRunning();
  const { speed, setSpeed } = useAutoScrollSpeed();
  const { mode, setMode } = useAutoScrollMode();
  const { stepPixels, stepIntervalMs, setStepPixels, setStepIntervalMs } = useAutoScrollStep();

  const setSpeedMemo = useCallback(
    (newSpeed: SpeedMultiplier) => {
      const clamped = clampSpeedMultiplier(newSpeed);
      setSpeed(clamped);
    },
    [setSpeed]
  );

  return {
    isRunning,
    speedMultiplier: speed,
    mode,
    stepPixels,
    stepIntervalMs,
    toggleAutoScroll,
    setSpeed: setSpeedMemo,
    setMode,
    setStepPixels,
    setStepIntervalMs,
  };
}
