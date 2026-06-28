import type { CSSProperties } from 'react'

import type { PanelIndicator, PanelIndicatorTone } from '../../RightPanelTabs.types'
import { cn } from '../../utils'

/**
 * Tone styles. Each tone supplies its own background, foreground, and a
 * `--ind-color` custom property used by the soft outer halo so the glow
 * matches the pill's hue.
 */
const TONE_CLASS: Record<PanelIndicatorTone, string> = {
  default: 'bg-primary text-primary-foreground [--ind-color:var(--color-primary)]',
  accent: 'bg-primary text-primary-foreground [--ind-color:var(--color-primary)]',
  warning: 'bg-amber-500 text-black [--ind-color:theme(colors.amber.500)]',
  danger: 'bg-destructive text-destructive-foreground [--ind-color:var(--color-destructive)]',
}

/**
 * Apple-grade badge material:
 *  - 1px inset top highlight for a subtle "lit chip" sheen.
 *  - 1px tinted outer ring + soft drop using the tone color, so the badge
 *    floats above the tab without a harsh border.
 *
 * Driven from `--ind-color` (set per-tone) — NOT from `currentColor`, so
 * the element's own text color stays free for the numeric glyph.
 */
const BADGE_SHADOW =
  'inset 0 0.5px 0 rgba(255,255,255,0.28), 0 0 0 0.5px color-mix(in srgb, var(--ind-color) 35%, transparent), 0 1px 3px color-mix(in srgb, var(--ind-color) 35%, transparent)'

const BADGE_STYLE: CSSProperties = { boxShadow: BADGE_SHADOW }

interface Props {
  indicator: PanelIndicator
  /** `'inline'` flows next to the label; `'overlay'` floats over the icon. */
  mode?: 'inline' | 'overlay'
  /** Accepted for backwards-compat; ignored (we no longer pulse forever). */
  pulse?: boolean
}

/**
 * Visual badge for a tab attention indicator. Renders a small dot for
 * `kind: 'dot'` and a clamped numeric pill for `kind: 'count'`.
 *
 * Motion: one-shot spring on appear. The parent re-keys this element on
 * count change so the spring replays — a single calm "bump" instead of an
 * Android-style infinite pulse.
 */
export function PanelIndicatorBadge({ indicator, mode = 'inline' }: Props) {
  const tone = TONE_CLASS[indicator.tone ?? 'default']
  const overlay = mode === 'overlay'

  if (indicator.kind === 'dot') {
    return (
      <span
        aria-hidden
        style={BADGE_STYLE}
        className={cn(
          'pointer-events-none rounded-full animate-panel-indicator-appear',
          overlay
            ? 'absolute top-0.5 right-0.5 h-2 w-2'
            : 'inline-block h-2 w-2 shrink-0',
          tone,
        )}
      />
    )
  }

  const max = indicator.max ?? 99
  const display = indicator.count > max ? `${max}+` : String(indicator.count)
  return (
    <span
      aria-hidden
      style={BADGE_STYLE}
      className={cn(
        'pointer-events-none rounded-full tabular-nums font-semibold text-center tracking-[-0.01em] animate-panel-indicator-appear',
        'inline-flex items-center justify-center text-[10px] leading-none shrink-0',
        overlay
          ? 'absolute -top-1 -right-1 min-w-[15px] h-[15px] px-[4px]'
          : 'min-w-[16px] h-[16px] px-[5px]',
        tone,
      )}
    >
      {display}
    </span>
  )
}
