import { env } from "./config"
import { RateLimitError } from "./errors"

const buckets = new Map<string, { count: number; resetAt: number }>()

export function assertRateLimit(key: string) {
  const limit = env.RATE_LIMIT_MAX
  const windowMs = env.RATE_LIMIT_WINDOW_MS
  const now = Date.now()

  const entry = buckets.get(key)
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (entry.count >= limit) {
    const retryAfter = Math.max(0, Math.ceil((entry.resetAt - now) / 1000))
    const error = new RateLimitError('Too many booking attempts, please try again shortly')
    ;(error as RateLimitError & { retryAfter?: number }).retryAfter = retryAfter
    throw error
  }

  entry.count += 1
}
