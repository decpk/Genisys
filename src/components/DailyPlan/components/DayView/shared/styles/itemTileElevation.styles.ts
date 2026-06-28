/**
 * Resting treatment shared by every DayView item tile (TaskCard, MeetingCard,
 * ReviewCard). Tiles are borderless and transparent at rest — rows sit flush
 * in the section well with no divider or surface. A subtle tint on hover is
 * the only affordance. Composed into each item card's base class to keep the
 * treatment DRY and consistent.
 */
export const itemTileElevationStyles = {
  base:
    'rounded-lg bg-transparent transition-colors duration-200 ease-out hover:bg-foreground/[0.035]',
} as const
