/**
 * Theme-agnostic elevation + material for the toast card so it "pops" off ANY
 * surface (light or dark) without changing the iOS-style frosted look:
 *   - slightly more solid material (`bg-card/90`) over `backdrop-blur-xl`
 *   - a full-strength `border` plus a hairline `ring` that reads on both themes
 *   - a layered drop shadow that lifts the card off light backgrounds
 *
 * Isolated as a pure function so the highlight stays tunable and unit-testable.
 */
export function getNotificationElevation(): string {
  return 'border border-border bg-card/90 backdrop-blur-xl ring-1 ring-black/[0.06] dark:ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.10)]'
}
