/**
 * Types for Notes Auto-Scroll Toolbar
 * Handles speed multiplier, running state, and UI prop definitions.
 */

/**
 * Speed multiplier range: 0.5x to 3x
 * @min 0.5 (slowest reading speed)
 * @max 3 (fastest reading speed)
 */
export type SpeedMultiplier = number & { readonly __brand: 'SpeedMultiplier' };

/**
 * Auto-scroll behaviour mode.
 * - `continuous`: smooth, constant-velocity scrolling (existing behaviour).
 * - `stepped`: jump by a fixed pixel distance, pause, then repeat.
 */
export type ScrollMode = 'continuous' | 'stepped';

/**
 * Auto-scroll controller state
 */
export interface AutoScrollState {
  isRunning: boolean;
  speedMultiplier: SpeedMultiplier;
  /** Active scroll behaviour mode. */
  mode: ScrollMode;
  /** Pixel distance moved on each step (stepped mode). */
  stepPixels: number;
  /** Wait interval between steps in milliseconds (stepped mode). */
  stepIntervalMs: number;
}

/**
 * Auto-scroll actions
 */
export interface AutoScrollActions {
  toggleAutoScroll: () => void;
  setSpeed: (speed: SpeedMultiplier) => void;
  /** Switch between continuous and stepped scroll modes. */
  setMode: (mode: ScrollMode) => void;
  /** Set the pixel distance moved on each step (stepped mode). */
  setStepPixels: (pixels: number) => void;
  /** Set the wait interval between steps in milliseconds (stepped mode). */
  setStepIntervalMs: (intervalMs: number) => void;
}

/**
 * Combined state + actions
 */
export interface UseNotesAutoScrollDataReturn extends AutoScrollState, AutoScrollActions {}

/**
 * Props for NotesAutoScrollToolbar component
 */
export interface NotesAutoScrollToolbarProps {
  isReadOnly?: boolean;
  /** Current note save status, shown on the left of the bottom toolbar. */
  saveStatus?: 'saving' | 'saved';
}
