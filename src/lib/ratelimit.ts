import type { NextRequest } from 'next/server'

// Sliding window rate limiter — in-memory, par IP.
// Limitation connue : chaque instance Lambda Vercel a son propre store.
// Sur un trafic élevé avec plusieurs instances, la limite n'est pas globalement appliquée.
// Solution production : remplacer par Upstash Redis (voir DECISIONS.md).

const store = new Map<string, number[]>()

function pruneStore(windowMs: number): void {
  const cutoff = Date.now() - windowMs
  for (const [ip, timestamps] of store) {
    if ((timestamps.at(-1) ?? 0) < cutoff) store.delete(ip)
  }
}

export function checkRateLimit(
  ip: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now()
  const cutoff = now - windowMs

  // Nettoyage probabiliste pour éviter la croissance infinie du store
  if (Math.random() < 0.01) pruneStore(windowMs)

  const timestamps = (store.get(ip) ?? []).filter((t) => t > cutoff)

  if (timestamps.length >= limit) {
    store.set(ip, timestamps)
    const resetMs = (timestamps[0] ?? now) + windowMs - now
    return { allowed: false, remaining: 0, resetMs }
  }

  timestamps.push(now)
  store.set(ip, timestamps)
  return { allowed: true, remaining: limit - timestamps.length, resetMs: windowMs }
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}
