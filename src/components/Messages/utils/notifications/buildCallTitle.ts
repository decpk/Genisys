import type { CallKind } from '@/components/Messages/Messages.types'

/** Builds the heading for an incoming-call notification, e.g. "Ada — Incoming video call". */
export function buildCallTitle(kind: CallKind, name: string): string {
  return `${name} — Incoming ${kind} call`
}
