import type { CallKind } from '@/components/Messages/Messages.types'

export interface IncomingCallPromptData {
  open: boolean
  kind: CallKind
  kindLabel: string
  peerSeed: string
  peerName: string
  accept: () => void
  decline: () => void
}
