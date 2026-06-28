import type { StoreApi } from 'zustand'
import type { ApiClientStore } from '../../api-client-store'
import type { ApiCollection } from '@/components/APIClient/APIClient.types'
import {
  UNCATEGORIZED_COLLECTION_ID,
  UNCATEGORIZED_COLLECTION_NAME,
} from '@/components/APIClient/APIClient.constants'

/**
 * Ensures the fixed "Uncategorized" collection exists, creating and persisting
 * it on first use. Returns its id. Lets users add requests without first
 * creating a collection.
 */
export async function ensureUncategorizedCollectionAction(
  get: () => ApiClientStore,
  set: StoreApi<ApiClientStore>['setState'],
): Promise<string> {
  const existing = get().collections.find((c) => c.id === UNCATEGORIZED_COLLECTION_ID)
  if (existing) return existing.id

  const ts = new Date().toISOString()
  const collection: ApiCollection = {
    id: UNCATEGORIZED_COLLECTION_ID,
    workspaceId: get().activeWorkspaceId,
    name: UNCATEGORIZED_COLLECTION_NAME,
    description: '',
    color: '',
    sortOrder: get().collections.length,
    deletedAt: null,
    createdAt: ts,
    updatedAt: ts,
  }
  set((s) => ({ collections: [...s.collections, collection] }))
  try {
    await window.api.apiSaveCollection(collection)
  } catch (err) {
    console.error('[api-client] Failed to create Uncategorized collection:', err)
    set((s) => ({ collections: s.collections.filter((c) => c.id !== collection.id) }))
    throw err
  }
  return collection.id
}
