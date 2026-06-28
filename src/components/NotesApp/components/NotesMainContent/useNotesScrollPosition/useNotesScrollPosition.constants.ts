export const SCROLL_POSITION_STORAGE_KEY = 'genisys:notes:scroll-positions:v1'
export const SCROLL_SAVE_DEBOUNCE_MS = 300
export const SCROLL_RESTORE_MAX_WAIT_MS = 1500
export const MAX_STORED_POSITIONS = 200
/** Saved offsets below this are treated as "top" and not restored (avoids tiny jumps). */
export const SCROLL_RESTORE_MIN_OFFSET = 4
