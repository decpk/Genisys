import type { AsyncLRUCacheConfig } from './async-lru-cache.types'

/**
 * A generic async LRU (Least Recently Used) cache.
 *
 * - Automatically loads values on cache miss via the configured `loader`.
 * - Deduplicates concurrent requests for the same key.
 * - Evicts the least-recently-used entry when capacity is exceeded.
 * - Fully framework-agnostic — works with any store, any data shape.
 *
 * @template K - Key type (e.g. conversation ID, session ID, chapter ID).
 * @template V - Value type (e.g. messages array, chapter content).
 *
 * @example
 * ```ts
 * const cache = new AsyncLRUCache<string, Message[]>({
 *   maxSize: 10,
 *   loader: (id) => fetchMessages(id),
 *   onEvict: (id) => console.log(`evicted ${id}`),
 * })
 *
 * const messages = await cache.get('conv-1')   // loads from DB on miss
 * const cached   = cache.peek('conv-1')        // returns instantly or undefined
 * cache.set('conv-1', [...messages, newMsg])   // update after mutation
 * cache.invalidate('conv-1')                   // remove on delete
 * ```
 */
export class AsyncLRUCache<K, V> {
  private readonly cache = new Map<K, V>()
  private readonly inflight = new Map<K, Promise<V>>()
  private readonly maxSize: number
  private readonly loader: (key: K) => Promise<V>
  private readonly onEvict?: (key: K, value: V) => void

  constructor(config: AsyncLRUCacheConfig<K, V>) {
    this.maxSize = config.maxSize
    this.loader = config.loader
    this.onEvict = config.onEvict
  }

  /** Number of entries currently in the cache. */
  get size(): number {
    return this.cache.size
  }

  /**
   * Get a value by key. Returns cached value (promoted to MRU) on hit,
   * or invokes the loader on miss. Concurrent calls for the same key
   * share a single in-flight promise.
   */
  async get(key: K): Promise<V> {
    // Cache hit — promote to most-recently-used
    if (this.cache.has(key)) {
      return this.promote(key)
    }

    // Deduplicate: if a load is already in-flight for this key, piggyback on it
    const pending = this.inflight.get(key)
    if (pending) {
      return pending
    }

    // Cache miss — load via the configured loader
    const promise = this.loader(key).then((value) => {
      this.inflight.delete(key)
      this.admitEntry(key, value)
      return value
    }).catch((error) => {
      this.inflight.delete(key)
      throw error
    })

    this.inflight.set(key, promise)
    return promise
  }

  /**
   * Peek at a cached value without promoting it in the LRU order.
   * Returns `undefined` on cache miss — never triggers a load.
   */
  peek(key: K): V | undefined {
    return this.cache.get(key)
  }

  /** Check whether a key exists in the cache. */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * Manually set or update a cached value (e.g. after appending a message).
   * Promotes the key to most-recently-used.
   */
  set(key: K, value: V): void {
    // If already present, delete first so re-insert moves it to the end
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    this.admitEntry(key, value)
  }

  /**
   * Remove a specific entry from the cache (e.g. after deleting a conversation).
   * Fires `onEvict` if the entry existed.
   */
  invalidate(key: K): void {
    const value = this.cache.get(key)
    if (value !== undefined) {
      this.cache.delete(key)
      this.onEvict?.(key, value)
    }
    // Also cancel any in-flight load for this key
    this.inflight.delete(key)
  }

  /** Remove all entries from the cache. Fires `onEvict` for each. */
  clear(): void {
    if (this.onEvict) {
      for (const [key, value] of this.cache) {
        this.onEvict(key, value)
      }
    }
    this.cache.clear()
    this.inflight.clear()
  }

  // ─── Private helpers ───────────────────────────────────────────

  /** Promote an existing key to most-recently-used (end of Map iteration order). */
  private promote(key: K): V {
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  /** Insert a key-value pair, evicting the LRU entry if at capacity. */
  private admitEntry(key: K, value: V): void {
    // Evict the least-recently-used entry (first item in Map) if at capacity
    if (this.cache.size >= this.maxSize) {
      const lruKey = this.cache.keys().next().value as K
      const lruValue = this.cache.get(lruKey)!
      this.cache.delete(lruKey)
      this.onEvict?.(lruKey, lruValue)
    }
    this.cache.set(key, value)
  }
}
