/**
 * Class-name constants for the inline quick-add-task composer.
 *
 * Pinned at the bottom of the Today's Agenda tile (outside the scroll area).
 * Borderless input on a subtle divider, with an amber-tinted focus accent to
 * match the tile's warm identity.
 */
export const AGENDA_ADD_TASK_STYLES = {
  /** Composer row — divider on top, plus icon + input. */
  form:
    'flex items-center gap-2 border-t border-border/40 px-3.5 h-[42px] shrink-0 ' +
    'focus-within:bg-amber-500/[0.04] transition-colors',

  /** Leading plus icon. */
  icon: 'shrink-0 text-muted-foreground/70',

  /** Borderless text input that blends into the tile surface. */
  input:
    'flex-1 min-w-0 bg-transparent text-[13px] text-foreground ' +
    'placeholder:text-muted-foreground/70 outline-none border-0 p-0',
} as const
