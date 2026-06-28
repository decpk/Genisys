/**
 * Shared color palette + helpers for note labels rendered as colored tags.
 *
 * Labels created from the sidebar historically stored `color: null`. To make
 * every label read as a modern colored tag without a data migration, we derive
 * a stable color from the label id when no explicit color is set.
 */

/** Tag palette (mirrors the ClipboardManager label palette for visual consistency). */
export const LABEL_PALETTE = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
] as const

/** Deterministic, stable color pick from an arbitrary seed (same seed → same color). */
export function pickLabelColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % LABEL_PALETTE.length
  return LABEL_PALETTE[index]
}

/** Resolve the effective color for a label, falling back to a derived color. */
export function resolveLabelColor(label: { id: string; color: string | null }): string {
  return label.color ?? pickLabelColor(label.id)
}
