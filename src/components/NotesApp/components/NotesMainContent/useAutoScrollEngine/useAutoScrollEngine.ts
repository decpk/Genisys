import { useEffect, useRef, useCallback } from 'react';
import { useNotesToc } from '@/components/NotesApp/NotesTocProvider';
import { startAutoScrollEngine } from './utils/startAutoScrollEngine';
import { startSteppedScrollEngine } from './utils/startSteppedScrollEngine';
import { convertMultiplierToPixelsPerSecond } from '../NotesAutoScrollToolbar/utils/speedConversion';
import { useStepCountdownStore } from '../NotesAutoScrollToolbar/store/stepCountdownStore';
import type { SpeedMultiplier, ScrollMode } from '../NotesAutoScrollToolbar/NotesAutoScrollToolbar.types';

/**
 * Props for useAutoScrollEngine hook
 */
interface UseAutoScrollEngineProps {
  isRunning: boolean;
  speedMultiplier: SpeedMultiplier;
  /** Active scroll behaviour mode (continuous vs stepped). */
  mode: ScrollMode;
  /** Pixel distance per step (stepped mode). */
  stepPixels: number;
  /** Wait interval between steps in ms (stepped mode). */
  stepIntervalMs: number;
  isReadOnly?: boolean;
  onBottomReached?: () => void;
}

/**
 * Hook: Manages the auto-scroll loop for the Notes editor.
 *
 * Supports two modes:
 * - `continuous`: smooth constant-velocity RAF scrolling at the chosen speed.
 * - `stepped`: jump by a fixed pixel distance, pause, then repeat.
 *
 * Lifecycle:
 * 1. When isRunning=true and container is available, starts the active engine.
 * 2. Stops automatically when:
 *    - User clicks pause (isRunning=false)
 *    - Reaches bottom of content
 *    - Container becomes unavailable (e.g., note change)
 *    - Component unmounts
 *
 * @param props - Configuration for auto-scroll behavior
 */
export function useAutoScrollEngine(props: UseAutoScrollEngineProps) {
  const {
    isRunning,
    speedMultiplier,
    mode,
    stepPixels,
    stepIntervalMs,
    isReadOnly = false,
    onBottomReached,
  } = props;
  void isReadOnly;
  void onBottomReached;

  const { scrollContainerRef } = useNotesToc();
  const cleanupRef = useRef<(() => void) | null>(null);
  const startCountdown = useStepCountdownStore((s) => s.startCountdown);
  const clearCountdown = useStepCountdownStore((s) => s.clearCountdown);

  // Memoized guard: should the scroll engine stop?
  const shouldStop = useCallback(() => {
    return !isRunning;
  }, [isRunning]);

  // Main effect: manage scroll loop lifecycle
  useEffect(() => {
    // Cleanup any previous loop
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Guard: Don't start if not running or container not available
    if (!isRunning || !scrollContainerRef.current) {
      clearCountdown();
      return;
    }

    const container = scrollContainerRef.current;

    // Start the engine for the active mode
    if (mode === 'stepped') {
      cleanupRef.current = startSteppedScrollEngine(
        container,
        stepPixels,
        stepIntervalMs,
        shouldStop,
        {
          onWaitStart: startCountdown,
          onIdle: clearCountdown,
        }
      );
    } else {
      clearCountdown();
      const pxPerSecond = convertMultiplierToPixelsPerSecond(speedMultiplier);
      cleanupRef.current = startAutoScrollEngine(container, pxPerSecond, shouldStop);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      clearCountdown();
    };
  }, [
    isRunning,
    speedMultiplier,
    mode,
    stepPixels,
    stepIntervalMs,
    scrollContainerRef,
    shouldStop,
    startCountdown,
    clearCountdown,
  ]);

  // Cleanup on unmount
  return () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
  };
}
