/**
 * Default baseline speed for auto-scroll: 1x multiplier = 60px/second
 * This is a comfortable reading pace for most users.
 */
export const DEFAULT_BASELINE_SPEED_PX_PER_SEC = 60;

/**
 * Minimum speed multiplier (0x = paused/no movement)
 */
export const MIN_SPEED_MULTIPLIER = 0;

/**
 * Maximum speed multiplier (fastest)
 */
export const MAX_SPEED_MULTIPLIER = 1.5;

/**
 * Default speed multiplier (normal reading pace)
 */
export const DEFAULT_SPEED_MULTIPLIER = 1.0;

/* ------------------------------------------------------------------ *
 * Stepped (interval) scroll mode
 * Scrolls by a fixed pixel distance, pauses, then repeats.
 * ------------------------------------------------------------------ */

/** Minimum pixel distance per step. */
export const MIN_STEP_PIXELS = 50;

/** Maximum pixel distance per step. */
export const MAX_STEP_PIXELS = 1000;

/** Default pixel distance per step. */
export const DEFAULT_STEP_PIXELS = 300;

/** Slider granularity for step pixels. */
export const STEP_PIXELS_INCREMENT = 10;

/** Minimum wait interval between steps (ms). */
export const MIN_STEP_INTERVAL_MS = 500;

/** Maximum wait interval between steps (ms). */
export const MAX_STEP_INTERVAL_MS = 60000;

/** Default wait interval between steps (ms). */
export const DEFAULT_STEP_INTERVAL_MS = 3000;

/** Slider granularity for the step interval (ms). */
export const STEP_INTERVAL_INCREMENT_MS = 500;

/** Duration of the smooth jump animation performed on each step (ms). */
export const STEP_SMOOTH_JUMP_DURATION_MS = 320;
