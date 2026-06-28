import type { ApiResponse } from '@/components/APIClient/APIClient.types'

interface MirrorSource {
  responsesByRequestId: Record<string, ApiResponse | null>
  sendingByRequestId: Record<string, boolean>
}

interface ActiveTabMirror {
  activeRequestId: string | null
  activeResponse: ApiResponse | null
  isSending: boolean
}

/**
 * Derives the legacy single-request mirror fields (`activeRequestId`,
 * `activeResponse`, `isSending`) from the per-request tab maps for a given
 * active tab id. Keeps backward-compatible consumers working while responses
 * and sending state live per-request.
 */
export function getActiveTabMirror(source: MirrorSource, id: string | null): ActiveTabMirror {
  if (!id) {
    return { activeRequestId: null, activeResponse: null, isSending: false }
  }
  return {
    activeRequestId: id,
    activeResponse: source.responsesByRequestId[id] ?? null,
    isSending: source.sendingByRequestId[id] ?? false,
  }
}
