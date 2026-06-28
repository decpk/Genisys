import { NOTES_SPLIT_MAX_RATIO, NOTES_SPLIT_MIN_RATIO } from '../split.constants'

/** Clamps a split divider ratio into the allowed range. */
export function clampSplitRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 0.5
  if (ratio < NOTES_SPLIT_MIN_RATIO) return NOTES_SPLIT_MIN_RATIO
  if (ratio > NOTES_SPLIT_MAX_RATIO) return NOTES_SPLIT_MAX_RATIO
  return ratio
}
