/**
 * Rate Limiter in-memory — Sem dependências externas.
 *
 * Usa uma Map com chave = IP e valor = timestamps dos requests.
 * Limpa entradas expiradas automaticamente para evitar memory leak.
 *
 * ⚠️ Funciona em instância única (Vercel Serverless ou dev local).
 * Para multi-instância em produção, migrar para Redis/Upstash.
 *
 * Uso:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 5 })
 *
 *   export async function POST(req: Request) {
 *     const limited = limiter.check(req)
 *     if (limited) return limited // NextResponse 429
 *     // ... lógica normal
 *   }
 */
import { NextResponse } from 'next/server'

interface RateLimitConfig {
  /** Janela de tempo em milissegundos (ex: 60_000 = 1 min) */
  windowMs: number
  /** Máximo de requests permitidos na janela */
  max: number
  /** Mensagem de erro customizada (opcional) */
  message?: string
}

interface RateLimiterInstance {
  /** Verifica se o IP excedeu o limite. Retorna null se OK, NextResponse 429 se bloqueado. */
  check: (req: Request) => NextResponse | null
}

// Storage global para persistir entre chamadas na mesma instância
const stores = new Map<string, Map<string, number[]>>()

// Cleanup automático a cada 5 minutos
let cleanupScheduled = false

function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true

  setInterval(() => {
    const now = Date.now()
    for (const [, store] of stores) {
      for (const [key, timestamps] of store) {
        const filtered = timestamps.filter(t => now - t < 300_000) // 5 min max
        if (filtered.length === 0) {
          store.delete(key)
        } else {
          store.set(key, filtered)
        }
      }
    }
  }, 300_000) // A cada 5 minutos
}

function getClientIp(req: Request): string {
  const headers = new Headers(req.headers)

  // Vercel / Cloudflare / proxies
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function createRateLimiter(config: RateLimitConfig): RateLimiterInstance {
  const storeKey = `${config.windowMs}-${config.max}`

  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map())
  }

  const store = stores.get(storeKey)!

  scheduleCleanup()

  return {
    check(req: Request): NextResponse | null {
      const ip = getClientIp(req)
      const now = Date.now()

      const timestamps = store.get(ip) || []
      const windowStart = now - config.windowMs

      // Filtra apenas os requests dentro da janela
      const recentRequests = timestamps.filter(t => t > windowStart)

      if (recentRequests.length >= config.max) {
        const retryAfterSec = Math.ceil((recentRequests[0] + config.windowMs - now) / 1000)

        return NextResponse.json(
          {
            error: config.message || 'Muitas requisições. Tente novamente em alguns segundos.',
            retryAfter: retryAfterSec,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSec),
              'X-RateLimit-Limit': String(config.max),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil((recentRequests[0] + config.windowMs) / 1000)),
            },
          }
        )
      }

      // Registra o request
      recentRequests.push(now)
      store.set(ip, recentRequests)

      return null // Permitido
    },
  }
}
