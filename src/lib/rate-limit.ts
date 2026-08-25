/**
 * In-process sliding window rate limiter.
 *
 * This is a memory-based rate limiter suitable for a single-process Next.js deployment.
 * For multi-instance deployments, replace the store with a Redis-backed equivalent.
 *
 * Design:
 * - Uses a Map<key, number[]> tracking hit timestamps per key
 * - Evicts timestamps outside the sliding window on each check
 * - Auto-sweeps stale keys every 5 minutes to prevent memory growth
 * - Thread-safe for single Node.js event loop (synchronous operations)
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  resetAt: Date;
}

interface WindowEntry {
  timestamps: number[];
  lastAccess: number;
}

/** Global store — survives across requests within the same process */
const store = new Map<string, WindowEntry>();

/** Sweep interval — cleans up keys idle for more than 30 minutes */
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const IDLE_TTL_MS = 30 * 60 * 1000;

function sweep() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.lastAccess > IDLE_TTL_MS) {
      store.delete(key);
    }
  }
}

// Schedule periodic sweep (only in server context)
if (typeof setInterval !== "undefined") {
  setInterval(sweep, SWEEP_INTERVAL_MS).unref?.();
}

/**
 * Checks and records a rate limit hit.
 *
 * @param key     Unique key for this rate limit bucket (e.g. "ip:1.2.3.4", "phone:+919876543210")
 * @param limit   Maximum number of hits allowed in the window
 * @param windowMs  Sliding window duration in milliseconds
 *
 * @returns RateLimitResult — `allowed` is false when limit is exceeded
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = store.get(key) ?? { timestamps: [], lastAccess: now };
  entry.lastAccess = now;

  // Evict timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= limit) {
    // Find the oldest timestamp still in the window
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    store.set(key, entry);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
      resetAt: new Date(oldest + windowMs),
    };
  }

  // Record this hit
  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    retryAfterMs: 0,
    resetAt: new Date(now + windowMs),
  };
}

/**
 * Pre-defined rate limit configurations for common surfaces.
 */
export const RATE_LIMITS = {
  /** Public inquiry submission — per IP */
  INQUIRY_PER_IP: { limit: 10, windowMs: 15 * 60 * 1000 },
  /** Public inquiry — per normalized phone (prevent phone harvesting) */
  INQUIRY_PER_PHONE: { limit: 3, windowMs: 60 * 60 * 1000 },
  /** Public inquiry — per normalized email */
  INQUIRY_PER_EMAIL: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Dashboard lead mutations */
  LEAD_MUTATION: { limit: 60, windowMs: 60 * 1000 },
  /** Dashboard search */
  LEAD_SEARCH: { limit: 120, windowMs: 60 * 1000 },
  /** Lead export — admin only */
  LEAD_EXPORT: { limit: 5, windowMs: 60 * 60 * 1000 },
  /** Anonymization actions */
  LEAD_ANONYMIZE: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const;
