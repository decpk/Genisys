export const ENTITY_HREF_PREFIX = '#entity:'

// Matches [[entity:<type>:<id>]] and [[entity:<type>:<id>|<label>]]
// type:  [a-z][a-z0-9-]*
// id:    one or more chars, NOT ':', '|', ']', or newline
// label: optional, NOT ']' or newline
export const ENTITY_TOKEN_REGEX = /\[\[entity:([a-z][a-z0-9-]*):([^:|\]\n]+)(?:\|([^\]\n]+))?\]\]/g
