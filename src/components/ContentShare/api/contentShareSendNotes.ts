import type { NotesShareKind, SendResult } from './types'

/** Share a notes selection (single note, container subtree, or everything). */
export async function contentShareSendNotes(
  deviceId: string,
  kind: NotesShareKind,
  id?: string,
): Promise<SendResult> {
  const res = await window.api.contentShareSendNotes(deviceId, kind, id)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to send notes')
  }
  return { accepted: !!res.accepted }
}
