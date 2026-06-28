/**
 * Recessed "well" body shared by every DayView section (Tasks, Meetings,
 * Reviews, Completed). It renders a sunken inset panel that visually frames
 * the raised item tiles placed inside it — establishing a clear card-vs-item
 * hierarchy. Reused across all section bodies to keep the treatment DRY and
 * consistent.
 */
export const sectionWellStyles = {
  // Neumorphic inset panel: the item list reads as pressed "into" the raised
  // section card via inset shadows — a dark inner shadow (top-left) paired
  // with a soft light inner highlight (bottom-right). Item-row spacing
  // (`space-y-*`) is added by the consumer, not here.
  well:
    'mx-2.5 mb-2.5 rounded-xl bg-background/35 p-2 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.12),inset_-1px_-1px_3px_rgba(255,255,255,0.015)]',
} as const
