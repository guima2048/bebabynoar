import { z } from 'zod'

// ========================================
// SCHEMAS DE USUÁRIO
// ========================================

export const userRegistrationSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  age: z.number().int().min(18, 'Idade mínima é 18 anos').max(100, 'Idade inválida'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gênero deve ser male, female ou other' })
  }),
  location: z.string().min(1, 'Localização é obrigatória').max(100, 'Localização muito longa'),
  bio: z.string().max(500, 'Bio muito longa').optional(),
  interests: z.array(z.string()).max(10, 'Máximo 10 interesses').optional(),
  lookingFor: z.enum(['sugar_baby', 'sugar_daddy', 'both'], {
    errorMap: () => ({ message: 'Tipo de busca inválido' })
  }).optional(),
  photos: z.array(z.string().url('URL de foto inválida')).max(10, 'Máximo 10 fotos').optional()
})

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo').optional(),
  age: z.number().int().min(18, 'Idade mínima é 18 anos').max(100, 'Idade inválida').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  location: z.string().min(1, 'Localização é obrigatória').max(100, 'Localização muito longa').optional(),
  bio: z.string().max(500, 'Bio muito longa').optional(),
  interests: z.array(z.string()).max(10, 'Máximo 10 interesses').optional(),
  lookingFor: z.enum(['sugar_baby', 'sugar_daddy', 'both']).optional(),
  photos: z.array(z.string().url('URL de foto inválida')).max(10, 'Máximo 10 fotos').optional()
})

// ========================================
// SCHEMAS DE FOTOS
// ========================================

export const photoUploadSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  type: z.enum(['profile', 'gallery', 'private'], {
    errorMap: () => ({ message: 'Tipo deve ser profile, gallery ou private' })
  }),
  file: z.any().refine((file) => file instanceof File, 'Arquivo é obrigatório'),
  maxSize: z.number().max(5 * 1024 * 1024, 'Arquivo muito grande (máximo 5MB)').optional(),
  acceptedTypes: z.array(z.string()).optional()
})

// ========================================
// SCHEMAS DE INTERESSE
// ========================================

export const sendInterestSchema = z.object({
  senderId: z.string().min(1, 'ID do remetente é obrigatório'),
  receiverId: z.string().min(1, 'ID do destinatário é obrigatório'),
  message: z.string().max(500, 'Mensagem muito longa').optional()
})

export const respondInterestSchema = z.object({
  interestId: z.string().min(1, 'ID do interesse é obrigatório'),
  response: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: 'Resposta deve ser accepted ou rejected' })
  }),
  message: z.string().max(500, 'Mensagem muito longa').optional()
})

// ========================================
// SCHEMAS DE CONVERSA
// ========================================

export const startConversationSchema = z.object({
  participant1Id: z.string().min(1, 'ID do primeiro participante é obrigatório'),
  participant2Id: z.string().min(1, 'ID do segundo participante é obrigatório'),
  initialMessage: z.string().min(1, 'Mensagem inicial é obrigatória').max(1000, 'Mensagem muito longa')
})

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'ID da conversa é obrigatório'),
  senderId: z.string().min(1, 'ID do remetente é obrigatório'),
  content: z.string().min(1, 'Conteúdo da mensagem é obrigatório').max(2000, 'Mensagem muito longa'),
  messageType: z.enum(['text', 'image', 'file']).default('text')
})

// ========================================
// SCHEMAS DE DENÚNCIA
// ========================================

export const reportUserSchema = z.object({
  reporterId: z.string().min(1, 'ID do denunciante é obrigatório'),
  reportedUserId: z.string().min(1, 'ID do usuário denunciado é obrigatório'),
  reason: z.enum([
    'inappropriate_content',
    'harassment',
    'fake_profile',
    'spam',
    'underage',
    'other'
  ], {
    errorMap: () => ({ message: 'Motivo de denúncia inválido' })
  }),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
  evidence: z.array(z.string().url('URL de evidência inválida')).max(5, 'Máximo 5 evidências').optional()
})

// ========================================
// SCHEMAS DE PAGAMENTO
// ========================================

export const processPaymentSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  plan: z.enum(['basic', 'premium', 'vip'], {
    errorMap: () => ({ message: 'Plano inválido' })
  }),
  paymentProof: z.string().url('URL do comprovante inválida'),
  paymentMethod: z.enum(['pix', 'transfer', 'card'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  }),
  amount: z.number().positive('Valor deve ser positivo')
})

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string().min(1, 'ID do pagamento é obrigatório'),
  status: z.enum(['approved', 'rejected', 'pending'], {
    errorMap: () => ({ message: 'Status inválido' })
  }),
  adminNotes: z.string().max(500, 'Notas muito longas').optional()
})

// ========================================
// SCHEMAS DE NOTIFICAÇÃO
// ========================================

export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  type: z.enum([
    'message',
    'interest',
    'profile_view',
    'photo_request',
    'payment_approved',
    'payment_rejected',
    'system'
  ], {
    errorMap: () => ({ message: 'Tipo de notificação inválido' })
  }),
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(500, 'Mensagem muito longa'),
  data: z.record(z.any()).optional(),
  read: z.boolean().default(false)
})

// ========================================
// SCHEMAS DE FOTOS PRIVADAS
// ========================================

export const requestPrivatePhotosSchema = z.object({
  requesterId: z.string().min(1, 'ID do solicitante é obrigatório'),
  ownerId: z.string().min(1, 'ID do proprietário é obrigatório'),
  message: z.string().max(500, 'Mensagem muito longa').optional()
})

export const respondPhotoRequestSchema = z.object({
  requestId: z.string().min(1, 'ID da solicitação é obrigatório'),
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status deve ser approved ou rejected' })
  }),
  response: z.string().max(500, 'Resposta muito longa').optional()
})

// ========================================
// SCHEMAS DE AVALIAÇÃO
// ========================================

export const createReviewSchema = z.object({
  reviewerId: z.string().min(1, 'ID do avaliador é obrigatório'),
  reviewedUserId: z.string().min(1, 'ID do avaliado é obrigatório'),
  rating: z.number().int().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5'),
  comment: z.string().min(10, 'Comentário deve ter pelo menos 10 caracteres').max(500, 'Comentário muito longo')
})

// ========================================
// SCHEMAS DE BLOQUEIO
// ========================================

export const blockUserSchema = z.object({
  blockerId: z.string().min(1, 'ID de quem bloqueia é obrigatório'),
  blockedUserId: z.string().min(1, 'ID de quem será bloqueado é obrigatório'),
  reason: z.string().max(200, 'Motivo muito longo').optional()
})

// ========================================
// SCHEMAS DE FAVORITOS
// ========================================

export const addToFavoritesSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  favoriteUserId: z.string().min(1, 'ID do favorito é obrigatório')
})

// ========================================
// SCHEMAS DE EVENTOS
// ========================================

export const createEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
  location: z.string().min(1, 'Localização é obrigatória').max(200, 'Localização muito longa'),
  date: z.string().datetime('Data inválida'),
  maxParticipants: z.number().int().min(1, 'Mínimo 1 participante').max(100, 'Máximo 100 participantes').optional(),
  price: z.number().min(0, 'Preço não pode ser negativo').optional(),
  organizerId: z.string().min(1, 'ID do organizador é obrigatório'),
  category: z.enum(['meetup', 'party', 'dinner', 'other'], {
    errorMap: () => ({ message: 'Categoria inválida' })
  })
})

// ========================================
// SCHEMAS DE BLOG
// ========================================

export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  content: z.string().min(100, 'Conteúdo deve ter pelo menos 100 caracteres'),
  excerpt: z.string().max(300, 'Resumo muito longo').optional(),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags').optional(),
  status: z.enum(['draft', 'published', 'archived'], {
    errorMap: () => ({ message: 'Status inválido' })
  }).default('draft'),
  authorId: z.string().min(1, 'ID do autor é obrigatório'),
  featuredImage: z.string().url('URL da imagem inválida').optional()
})

// ========================================
// SCHEMAS DE RESET DE SENHA
// ========================================

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório')
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório')
})

// ========================================
// SCHEMAS DE ADMIN
// ========================================

export const adminLoginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const moderateContentSchema = z.object({
  contentId: z.string().min(1, 'ID do conteúdo é obrigatório'),
  contentType: z.enum(['user', 'photo', 'message', 'review'], {
    errorMap: () => ({ message: 'Tipo de conteúdo inválido' })
  }),
  action: z.enum(['approve', 'reject', 'warn'], {
    errorMap: () => ({ message: 'Ação inválida' })
  }),
  reason: z.string().max(500, 'Motivo muito longo').optional()
})

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

export function sanitizeString(str: string): string {
  return str.trim().replace(/<[^>]*>/g, '') // Remove HTML tags
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => err.message) 
      }
    }
    return { success: false, errors: ['Erro de validação desconhecido'] }
  }
}

export function createErrorResponse(errors: string[], status: number = 400) {
  return {
    error: 'Dados inválidos',
    details: errors,
    status
  }
} 