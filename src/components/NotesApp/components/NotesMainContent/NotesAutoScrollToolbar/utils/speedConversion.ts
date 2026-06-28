import {
  DEFAULT_BASELINE_SPEED_PX_PER_SEC,
  MIN_SPEED_MULTIPLIER,
  MAX_SPEED_MULTIPLIER,
} from './autoScrollConstants';
import type { SpeedMultiplier } from '../NotesAutoScrollToolbar.types';

/**
 * Type guard: Safely cast a number to SpeedMultiplier.
 * Used when loading persisted speed values from store.
 *
 * @param value - Number to cast
 * @returns Typed SpeedMultiplier
 */
export function toSpeedMultiplier(value: number): SpeedMultiplier {
  return value as SpeedMultiplier;
}

/**
 * Converts a speed multiplier (0.5x–3x) to pixels per second.
 * Formula: multiplier × baseline speed = px/s
 * Example: 1.5x × 60px/s = 90px/s
 *
 * @param multiplier - Speed multiplier between 0.5 and 3.0
 * @returns Pixels per second (float)
 */
export function convertMultiplierToPixelsPerSecond(multiplier: number): number {
  return multiplier * DEFAULT_BASELINE_SPEED_PX_PER_SEC;
}

/**
 * Clamps a speed multiplier to valid range [MIN, MAX].
 * Used to validate user input and ensure speed stays within acceptable bounds.
 *
 * @param multiplier - Speed multiplier (may be outside valid range)
 * @returns Clamped multiplier as SpeedMultiplier type
 */
export function clampSpeedMultiplier(multiplier: number): SpeedMultiplier {
  const clamped = Math.max(MIN_SPEED_MULTIPLIER, Math.min(MAX_SPEED_MULTIPLIER, multiplier));
  return clamped as SpeedMultiplier;
}

/**
 * Formats a speed multiplier for display to the user.
 * Example: 1.5 → "1.50x" or "1.5x" depending on rounding
 *
 * @param multiplier - Speed multiplier
 * @returns Formatted string (e.g., "1.5x", "2.0x")
 */
export function formatSpeedDisplay(multiplier: number): string {
  const rounded = Math.round(multiplier * 100) / 100;
  return `${rounded.toFixed(2)}x`.replace(/\.?0+x$/, 'x'); // Remove trailing zeros
}
