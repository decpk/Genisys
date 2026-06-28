import type { Message, MsgEnvelope } from '@/components/Messages/Messages.types'

import { base64ToObjectUrl } from './base64ToObjectUrl'

// Convert a bridge envelope into a UI message, materialising image payloads
// into an object URL so they can be rendered without re-decoding base64.
export function envelopeToMessage(envelope: MsgEnvelope): Message {
  let imageObjectUrl: string | null = null
  if (envelope.kind === 'image' && envelope.imageBase64) {
    imageObjectUrl = base64ToObjectUrl(
      envelope.imageBase64,
      envelope.mimeType ?? 'image/png'
    )
  }
  return { ...envelope, imageObjectUrl }
}
