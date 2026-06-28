/**
 * Configuration for creating an AsyncLRUCache instance.
 *
 * @template K - Key type used to identify cached entries.
 * @template V - Value type stored in the cache.
 */
export interface AsyncLRUCacheConfig<K, V> {
  /** Maximum number of entries the cache will hold before evicting the least-recently-used. */
  maxSize: number
  /** Async function called on cache miss to load the value for a given key. */
  loader: (key: K) => Promise<V>
  /** Optional callback fired when an entry is evicted due to capacity or manual invalidation. */
  onEvict?: (key: K, value: V) => void
}
