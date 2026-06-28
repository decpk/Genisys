import { cn } from '@/lib/utils'

import type { TerminalTheme } from './terminalThemes.types'

/** ANSI accent colors surfaced in the swatch, left → right. */
const ACCENT_KEYS = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'] as const

/**
 * Compact preview chip for a terminal color scheme: the theme `background`
 * filled with a row of its ANSI accent colors. Almost every dark scheme shares
 * a near-black background, so a background-only swatch makes every theme look
 * identical. The accent colors differ sharply between schemes, so surfacing
 * them is what makes each theme recognizable in the picker.
 *
 * Purely decorative (`aria-hidden`) — callers must render the theme name as the
 * accessible text label alongside it.
 */
export function TerminalThemeSwatch({
  theme,
  className,
}: {
  theme: TerminalTheme
  className?: string
}): React.JSX.Element {
  const c = theme.colors
  return (
    <span
      className={cn(
        'inline-flex h-[14px] w-[26px] shrink-0 items-center justify-center gap-[1.5px] rounded-sm border border-border/40',
        className,
      )}
      style={{ backgroundColor: c.background }}
      aria-hidden="true"
    >
      {ACCENT_KEYS.map((key) => (
        <span
          key={key}
          className="h-[8px] w-[2px] rounded-[1px]"
          style={{ backgroundColor: c[key] }}
        />
      ))}
    </span>
  )
}
