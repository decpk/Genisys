import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'

/**
 * Lazily loads a request's body content from the backend when it has not yet
 * been hydrated. No-op when the request is missing or its body is already
 * present. Mirrors the lazy-load behaviour the single-request panel relied on.
 */
export function loadRequestBodyIfNeeded(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
  id: string,
): void {
  const req = get().requests.find((r) => r.id === id)
  if (!req || req.bodyContent) return
  window.api.apiLoadRequestBody(id).then((body) => {
    if (body == null) return
    set((s) => ({
      requests: s.requests.map((r) => (r.id === id ? { ...r, bodyContent: body } : r)),
    }))
  })
}
