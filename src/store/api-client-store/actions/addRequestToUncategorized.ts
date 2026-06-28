import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import type { ApiRequestItem } from '@/components/APIClient/APIClient.types'
import { ensureUncategorizedCollectionAction } from './ensureUncategorizedCollection'

/**
 * Creates a blank request inside the default "Uncategorized" collection
 * (creating that collection on first use) and returns it. Reuses the store's
 * existing `addRequest` action so persistence stays consistent.
 */
export async function addRequestToUncategorizedAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
): Promise<ApiRequestItem> {
  const collectionId = await ensureUncategorizedCollectionAction(get, set)
  return get().addRequest(collectionId, 'New Request', 'GET')
}
