/**
 * Stable, unique tile ids for *singleton* tiles (one instance per dashboard).
 *
 * Multi-instance tile kinds (projects, live-sports) generate their own ids
 * dynamically and are NOT listed here.
 *
 * Centralised so any future cleanup/migration logic can reference them
 * without re-deriving the literal string.
 */
export const SNIPPETS_TILE_ID = '__snippets__'
export const TODAYS_AGENDA_TILE_ID = '__todays_agenda__'
export const CURRENTLY_READING_TILE_ID = '__currently_reading__'
export const CLIPBOARD_QUICK_ACCESS_TILE_ID = '__clipboard_quick_access__'
export const QUICK_PROMPTS_TILE_ID = '__quick_prompts__'
/** Reuses the legacy `__focus_timer__` id for seamless migration. */
export const TIMER_TILE_ID = '__focus_timer__'
export const STOCKS_TILE_ID = '__stocks_tile__'
export const KEEP_AWAKE_TILE_ID = '__keep_awake__'
export const TIME_CALENDAR_TILE_ID = '__time_calendar__'
