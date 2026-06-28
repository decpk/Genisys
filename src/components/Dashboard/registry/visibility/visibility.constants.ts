/**
 * Visibility key for the *grouped* Live Sports tiles.
 *
 * All individual `sports-*` tiles are toggled on/off together via this single
 * key. They do not appear in the persisted singleton tile id list because each
 * sport tile has a dynamic id.
 */
export const LIVE_SPORTS_VISIBILITY_KEY = '__live_sports__'

/** Prefix used by all dynamic Live Sports tile ids. */
export const SPORTS_TILE_ID_PREFIX = 'sports-'
