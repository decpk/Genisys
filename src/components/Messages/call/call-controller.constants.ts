// Audio assets for call ring/ringback. There is no dedicated call sound yet,
// so we reuse louder existing timer tones served from `public/` (a soft chime
// was too quiet for an attention-grabbing ring).
// TODO: dedicated call ringtone asset
export const CALL_RINGTONE_SRC = '/sounds/timer/bell.mp3'

// TODO: dedicated call ringback asset
export const CALL_RINGBACK_SRC = '/sounds/timer/digital.mp3'

/**
 * Safety cap: how long an unanswered incoming call keeps ringing before it
 * converts to "missed". The ring is meant to be effectively continuous — it
 * normally stops only when the user accepts/declines or the caller cancels /
 * disconnects — so this is a long backstop, not the expected end of the ring.
 */
export const CALL_RING_TIMEOUT_MS = 120_000
