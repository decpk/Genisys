// Disappearing-message TTL choices offered in the conversation header. `ms`
// of 0 disables disappearing messages for the conversation.
export interface EphemeralTtlOption {
  label: string
  ms: number
}

export const EPHEMERAL_TTL_OPTIONS: readonly EphemeralTtlOption[] = [
  { label: 'Off', ms: 0 },
  { label: '30 seconds', ms: 30_000 },
  { label: '5 minutes', ms: 5 * 60_000 },
  { label: '1 hour', ms: 60 * 60_000 },
  { label: '1 day', ms: 24 * 60 * 60_000 },
] as const
