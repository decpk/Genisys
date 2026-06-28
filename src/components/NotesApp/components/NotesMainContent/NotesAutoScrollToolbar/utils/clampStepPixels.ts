import { MIN_STEP_PIXELS, MAX_STEP_PIXELS } from './autoScrollConstants';

/**
 * Clamps a step pixel distance to the valid range [MIN, MAX].
 * Used to validate slider input for stepped scroll mode.
 *
 * @param pixels - Requested pixel distance per step
 * @returns Clamped pixel distance
 */
export function clampStepPixels(pixels: number): number {
  return Math.max(MIN_STEP_PIXELS, Math.min(MAX_STEP_PIXELS, Math.round(pixels)));
}
