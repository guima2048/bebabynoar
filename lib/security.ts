// Configurações de segurança centralizadas

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    API: { requests: 100, window: 60 * 1000 }, // 100 requests por minuto
    AUTH: { requests: 5, window: 15 * 60 * 1000 }, // 5 tentativas por 15 minutos
    UPLOAD: { requests: 10, window: 60 * 1000 }, // 10 uploads por minuto
    REGISTER: { requests: 3, window: 15 * 60 * 1000 }, // 3 registros por 15 minutos
  },

  // Validação de arquivos
  FILE_VALIDATION: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  // Sessões
  SESSION: {
    ADMIN_COOKIE_NAME: 'admin_session',
    ADMIN_COOKIE_MAX_AGE: 60 * 60 * 24, // 24 horas
    USER_COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 dias
  },

  // Senhas
  PASSWORD: {
    MIN_LENGTH: 6,
    SALT_ROUNDS: 12,
  },

  // Headers de segurança
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  },

  // CORS
  CORS: {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
    CREDENTIALS: true,
  },

  // Logs
  LOGGING: {
    ENABLE_SECURITY_LOGS: true,
    LOG_SENSITIVE_ACTIONS: true,
    LOG_FAILED_LOGINS: true,
  },
}

// Funções de validação de segurança
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 100
}

export function validatePassword(password: string): boolean {
  return password.length >= SECURITY_CONFIG.PASSWORD.MIN_LENGTH && 
         password.length <= 100 &&
         typeof password === 'string'
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  return input.trim().slice(0, 1000) // Limitar a 1000 caracteres
}

export function generateSecureToken(): string {
  return crypto.randomUUID()
}

export function validateFileType(file: File): boolean {
  return SECURITY_CONFIG.FILE_VALIDATION.ALLOWED_TYPES.includes(file.type) &&
         file.size <= SECURITY_CONFIG.FILE_VALIDATION.MAX_SIZE
}

// Função para aplicar headers de segurança
export function applySecurityHeaders(headers: Headers): void {
  Object.entries(SECURITY_CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
    headers.set(key, value)
  })
}

// Função para log de segurança
export function logSecurityEvent(event: string, details: any = {}): void {
  if (SECURITY_CONFIG.LOGGING.ENABLE_SECURITY_LOGS) {
    console.log(`🔒 SECURITY: ${event}`, {
      timestamp: new Date().toISOString(),
      ...details
    })
  }
} 