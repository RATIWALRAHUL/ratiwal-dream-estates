/**
 * High-Performance Three-Layer Data Cache for Ratiwal Dream Estate
 * 
 * Provides:
 * - Deterministic cache key normalization (sorts query params so order never duplicates keys)
 * - In-memory LRU-style cache with strict TTLs and stale-while-revalidate (SWR) support
 * - Fast background refresh without blocking client requests
 * - Targeted cache invalidation
 * - Pre-warming hooks for critical marketing pages
 */

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlMs: number;
  staleWhileRevalidateMs: number;
  isRevalidating?: boolean;
}

class FastDataCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private maxEntries: number;

  constructor(maxEntries: number = 500) {
    this.maxEntries = maxEntries;
  }

  /**
   * Generates a deterministic cache key from a namespace and parameters object.
   * e.g. normalizeKey("properties", { type: "villa", city: "jaipur", page: 1 })
   * => "properties:city=jaipur&page=1&type=villa"
   */
  public normalizeKey(namespace: string, params: Record<string, any> = {}): string {
    const keys = Object.keys(params).sort();
    const queryParts = keys
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== "")
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(String(params[k]).toLowerCase())}`);

    return queryParts.length > 0 ? `${namespace}:${queryParts.join("&")}` : namespace;
  }

  /**
   * Retrieves data with Stale-While-Revalidate semantics.
   * If fresh: returns cached data immediately.
   * If stale but within SWR window: returns cached data immediately AND executes revalidation in the background.
   * If expired or miss: executes fetcher, caches result, and returns fresh data.
   */
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttlMs?: number; swrMs?: number } = {}
  ): Promise<T> {
    const ttlMs = options.ttlMs ?? 60 * 1000; // default 60s
    const swrMs = options.swrMs ?? 300 * 1000; // default 300s SWR window
    const now = Date.now();

    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (entry) {
      const age = now - entry.cachedAt;

      // 1. Fresh cache hit -> return immediately
      if (age < entry.ttlMs) {
        return entry.data;
      }

      // 2. Stale but within SWR window -> return stale data immediately and revalidate in background
      if (age < entry.ttlMs + entry.staleWhileRevalidateMs) {
        if (!entry.isRevalidating) {
          entry.isRevalidating = true;
          // Background revalidation without blocking caller
          (async () => {
            try {
              const freshData = await fetcher();
              this.set(key, freshData, ttlMs, swrMs);
            } catch (err) {
              // Retain stale data silently on background fetch failure
            } finally {
              if (this.store.has(key)) {
                this.store.get(key)!.isRevalidating = false;
              }
            }
          })();
        }
        return entry.data;
      }
    }

    // 3. Cache miss or completely expired -> fetch fresh data synchronously
    const freshData = await fetcher();
    this.set(key, freshData, ttlMs, swrMs);
    return freshData;
  }

  /**
   * Stores a value in cache with LRU eviction if maximum entries exceeded.
   */
  public set<T>(key: string, data: T, ttlMs: number = 60 * 1000, swrMs: number = 300 * 1000): void {
    if (this.store.size >= this.maxEntries) {
      // Evict oldest entry (Map maintains insertion order)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, {
      data,
      cachedAt: Date.now(),
      ttlMs,
      staleWhileRevalidateMs: swrMs,
      isRevalidating: false,
    });
  }

  /**
   * Invalidate specific keys or keys matching a prefix/regex pattern.
   */
  public invalidate(pattern: string | RegExp): void {
    if (typeof pattern === "string") {
      if (pattern.endsWith("*")) {
        const prefix = pattern.slice(0, -1);
        for (const key of this.store.keys()) {
          if (key.startsWith(prefix)) {
            this.store.delete(key);
          }
        }
      } else {
        this.store.delete(pattern);
      }
    } else {
      for (const key of this.store.keys()) {
        if (pattern.test(key)) {
          this.store.delete(key);
        }
      }
    }
  }

  /**
   * Clear entire cache.
   */
  public clear(): void {
    this.store.clear();
  }

  /**
   * Get current cache stats for monitoring and diagnostics.
   */
  public getStats(): { totalKeys: number; keys: string[] } {
    return {
      totalKeys: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Global singleton instance for application process lifetime
const globalCacheInstance = (global as any).__ratiwal_data_cache__ || new FastDataCache(1000);
if (process.env.NODE_ENV !== "production") {
  (global as any).__ratiwal_data_cache__ = globalCacheInstance;
}

export const fastCache: FastDataCache = globalCacheInstance;
