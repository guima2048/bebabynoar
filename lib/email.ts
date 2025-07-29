import sgMail from '@sendgrid/mail'
import { prisma } from './prisma'

interface EmailData {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
  forceSend?: boolean // Se true, envia mesmo para premium (ex: recibo, redefinição)
}

interface TemplateData {
  [key: string]: string
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  /**
   * Envia email, mas bloqueia para usuários premium, exceto se forceSend=true
   */
  static async sendEmail(emailData: EmailData, templateId?: string): Promise<boolean> {
    try {
      // Checar se destinatário é premium
      if (!emailData.forceSend) {
        const user = await prisma.user.findUnique({ where: { email: emailData.to } })
        if (user?.premium) {
          console.log(`Email NÃO enviado para usuário premium: ${emailData.to}`)
          return false
        }
      }
      const msg = {
        to: emailData.to,
        from: emailData.from || 'no-reply@bebaby.app',
        subject: emailData.subject,
        text: emailData.text || '',
        html: emailData.html,
      }
      await sgMail.send(msg)
      return true
    } catch (error) {
      console.error('Erro ao enviar email via SendGrid:', error)
      return false
    }
  }
} 