import { z } from 'zod'

// Schemas de validação
export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z.string().min(3, 'Username deve ter pelo menos 3 caracteres').max(30, 'Username deve ter no máximo 30 caracteres'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  birthdate: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 18 && age <= 100
  }, 'Você deve ter entre 18 e 100 anos'),
  gender: z.enum(['homem', 'mulher']),
  userType: z.enum(['sugar_baby', 'sugar_daddy', 'sugar_mommy']),
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().min(2, 'Estado deve ter pelo menos 2 caracteres'),
})

export const profileUpdateSchema = z.object({
  about: z.string().max(1000, 'Sobre deve ter no máximo 1000 caracteres').optional(),
  lookingFor: z.string().max(1000, 'O que busca deve ter no máximo 1000 caracteres').optional(),
  
  
  education: z.string().max(100).optional(),
  profession: z.string().max(100).optional(),
  
  
  
  
  
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Mensagem não pode estar vazia').max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),
  receiverId: z.string().min(1, 'ID do destinatário é obrigatório'),
})

export const interestSchema = z.object({
  message: z.string().max(500, 'Mensagem deve ter no máximo 500 caracteres').optional(),
  receiverId: z.string().min(1, 'ID do destinatário é obrigatório'),
})

export const reportSchema = z.object({
  reason: z.string().min(1, 'Motivo é obrigatório').max(200, 'Motivo deve ter no máximo 200 caracteres'),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional(),
  targetUserId: z.string().min(1, 'ID do usuário reportado é obrigatório'),
})

export const blogPostSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  excerpt: z.string().max(300, 'Resumo deve ter no máximo 300 caracteres').optional(),
  featuredImage: z.string().url('URL da imagem deve ser válida').optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória').optional(),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').optional(),
})

// Funções de validação
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Erro de validação desconhecido'] }
  }
}

// Funções de sanitização
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres potencialmente perigosos
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizeUsername(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '') // Apenas letras, números, underscore e hífen
}

// Funções de validação específicas
export function isValidImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize
}

export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isStrongPassword(password: string): boolean {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
}

// Funções de formatação
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 