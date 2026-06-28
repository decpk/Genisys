/**
 * NotesAutoScrollToolbar barrel exports
 */

export { NotesAutoScrollToolbar } from './NotesAutoScrollToolbar';
export type { NotesAutoScrollToolbarProps, AutoScrollState, AutoScrollActions, UseNotesAutoScrollDataReturn, ScrollMode } from './NotesAutoScrollToolbar.types';
export { useNotesAutoScrollData } from './hooks/useNotesAutoScrollData';
export { useAutoScrollRunning } from './hooks/useAutoScrollRunning';
export { useAutoScrollSpeed } from './hooks/useAutoScrollSpeed';
export { useAutoScrollMode } from './hooks/useAutoScrollMode';
export { useAutoScrollStep } from './hooks/useAutoScrollStep';
export { convertMultiplierToPixelsPerSecond, clampSpeedMultiplier, formatSpeedDisplay } from './utils/speedConversion';
export { DEFAULT_BASELINE_SPEED_PX_PER_SEC, MIN_SPEED_MULTIPLIER, MAX_SPEED_MULTIPLIER, DEFAULT_SPEED_MULTIPLIER } from './utils/autoScrollConstants';
