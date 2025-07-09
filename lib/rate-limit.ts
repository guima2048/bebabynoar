interface RateLimitConfig {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

class RateLimiter {
  private tokens: Map<string, { count: number; resetTime: number }> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(limit: number, identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const key = `${identifier}:${Math.floor(now / this.config.interval)}`
    
    const current = this.tokens.get(key)
    
    if (!current) {
      this.tokens.set(key, { count: 1, resetTime: now + this.config.interval })
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + this.config.interval
      }
    }
    
    if (current.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: current.resetTime
      }
    }
    
    current.count++
    return {
      success: true,
      limit,
      remaining: limit - current.count,
      reset: current.resetTime
    }
  }

  // Limpar tokens expirados periodicamente
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.tokens.entries()) {
      if (now > value.resetTime) {
        this.tokens.delete(key)
      }
    }
  }
}

// Instâncias de rate limiting para diferentes endpoints
export const apiLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 1000
})

export const authLimiter = new RateLimiter({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 500
})

export const uploadLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 100
})

// Função helper para rate limiting
export function rateLimit(config: RateLimitConfig) {
  return new RateLimiter(config)
}

// Limpar tokens expirados a cada 5 minutos
setInterval(() => {
  apiLimiter.cleanup()
  authLimiter.cleanup()
  uploadLimiter.cleanup()
}, 5 * 60 * 1000) 