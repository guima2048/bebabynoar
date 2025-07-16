import { prisma } from './prisma'

interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

interface TemplateData {
  [key: string]: string
}

export class EmailService {
  private static async getSMTPConfig() {
    const config = await prisma.sMTPConfig.findUnique({
      where: { id: 'main' }
    })

    if (!config) {
      throw new Error('Configuração SMTP não encontrada')
    }

    return config
  }

  private static replaceTemplateVariables(template: string, data: TemplateData): string {
    let result = template
    
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    }
    
    return result
  }

  static async sendEmail(emailData: EmailData, templateId?: string): Promise<boolean> {
    let logId: string | undefined

    try {
      // Criar log inicial
      const logData: any = {
        to: emailData.to,
        subject: emailData.subject,
        status: 'PENDING',
        metadata: {
          from: emailData.from,
          timestamp: new Date().toISOString()
        }
      }
      
      if (templateId) {
        logData.templateId = templateId
      }
      
      const log = await prisma.emailLog.create({
        data: logData
      })
      logId = log.id

      const smtpConfig = await this.getSMTPConfig()

      const response = await fetch('https://api.smtplw.com.br/v1/messages', {
        method: 'POST',
        headers: {
          'x-auth-token': smtpConfig.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          from: emailData.from || smtpConfig.from
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro na API Locaweb:', errorData)
        
        // Atualizar log com erro
        if (logId) {
          await prisma.emailLog.update({
            where: { id: logId },
            data: {
              status: 'FAILED',
              error: `Erro ${response.status}: ${JSON.stringify(errorData)}`,
              metadata: {
                ...errorData,
                responseStatus: response.status
              }
            }
          })
        }
        
        throw new Error(`Erro ao enviar e-mail: ${response.status}`)
      }

      // Atualizar log com sucesso
      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'SENT',
            sentAt: new Date()
          }
        })
      }

      return true
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
      
      // Atualizar log com erro se ainda não foi atualizado
      if (logId) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          }
        }).catch(() => {}) // Ignorar erro se não conseguir atualizar
      }
      
      throw error
    }
  }

  static async sendTemplateEmail(
    templateSlug: string, 
    to: string, 
    data: TemplateData
  ): Promise<boolean> {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { slug: templateSlug }
      })

      if (!template) {
        throw new Error(`Template "${templateSlug}" não encontrado`)
      }

      if (!template.enabled) {
        console.log(`Template "${templateSlug}" está desabilitado`)
        return false
      }

      const subject = this.replaceTemplateVariables(template.subject, data)
      const html = this.replaceTemplateVariables(template.body, data).replace(/\n/g, '<br>')

      return await this.sendEmail({
        to,
        subject,
        html
      }, template.id)
    } catch (error) {
      console.error('Erro ao enviar e-mail com template:', error)
      throw error
    }
  }

  // Métodos específicos para tipos de e-mail
  static async sendEmailConfirmation(email: string, name: string, confirmationLink: string): Promise<boolean> {
    return this.sendTemplateEmail('email-confirmation', email, {
      nome: name,
      link_confirmacao: confirmationLink
    })
  }

  static async sendWelcomeEmail(email: string, name: string, siteLink: string): Promise<boolean> {
    return this.sendTemplateEmail('welcome', email, {
      nome: name,
      link_site: siteLink
    })
  }

  static async sendMessageNotification(email: string, name: string, sender: string, messagePreview: string, messagesLink: string): Promise<boolean> {
    return this.sendTemplateEmail('message-received', email, {
      nome: name,
      remetente: sender,
      mensagem_preview: messagePreview,
      link_mensagens: messagesLink
    })
  }

  static async sendProfileFavoritedNotification(email: string, name: string, favoriter: string, profileLink: string): Promise<boolean> {
    return this.sendTemplateEmail('profile-favorited', email, {
      nome: name,
      favoritador: favoriter,
      link_perfil_favoritador: profileLink
    })
  }

  static async sendProfileViewedNotification(email: string, name: string, viewer: string, profileLink: string): Promise<boolean> {
    return this.sendTemplateEmail('profile-viewed', email, {
      nome: name,
      visualizador: viewer,
      link_perfil_visualizador: profileLink
    })
  }

  static async sendAccountBannedNotification(email: string, name: string, reason: string, duration: string): Promise<boolean> {
    return this.sendTemplateEmail('account-banned', email, {
      nome: name,
      motivo_banimento: reason,
      duracao_banimento: duration
    })
  }

  static async sendAccountDeletedNotification(email: string, name: string): Promise<boolean> {
    return this.sendTemplateEmail('account-deleted', email, {
      nome: name
    })
  }

  static async sendNewsletter(email: string, name: string, content: string): Promise<boolean> {
    return this.sendTemplateEmail('newsletter', email, {
      nome: name,
      conteudo_newsletter: content
    })
  }
} 