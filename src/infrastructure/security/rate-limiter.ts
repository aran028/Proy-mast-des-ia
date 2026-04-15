interface RateLimiterOptions {
  windowMs: number
  maxRequests: number
}

interface Bucket {
  count: number
  resetAt: number
}

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>()

  constructor(private readonly options: RateLimiterOptions) {}

  check(key: string, now: number = Date.now()): { allowed: boolean; retryAfterMs: number } {
    const bucket = this.buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.options.windowMs })
      return { allowed: true, retryAfterMs: 0 }
    }

    if (bucket.count >= this.options.maxRequests) {
      return { allowed: false, retryAfterMs: bucket.resetAt - now }
    }

    bucket.count += 1
    return { allowed: true, retryAfterMs: 0 }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export const promptGeneratorRateLimiter = new InMemoryRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
})
