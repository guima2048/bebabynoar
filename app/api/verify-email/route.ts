import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o email já está verificado
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email já está verificado' },
        { status: 400 }
      )
    }

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: tokenExpiry,
        lastVerificationEmailSent: new Date()
      }
    })

    // Enviar e-mail de verificação
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
    
    await sendVerificationEmail(email, verificationUrl, user.name || 'Usuário')

    return NextResponse.json({
      success: true,
      message: 'E-mail de verificação enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Verificar token de email
export async function PUT(req: NextRequest) {
  try {
    const { token, email } = await req.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o token é válido
    if (user.emailVerificationToken !== token) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar se o token não expirou
    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Marcar email como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiry: null
      }
    })

    // Enviar e-mail de confirmação
    await sendEmailVerifiedConfirmation(email, user.name || 'Usuário')

    return NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function sendVerificationEmail(email: string, verificationUrl: string, userName: string) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email }],
        subject: 'Verifique seu email - Bebaby App',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📧 Verifique seu Email</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Olá, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Para completar seu cadastro no Bebaby App, precisamos verificar seu endereço de email.
              </p>
              
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Verificar Email
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </p>
              
              <p style="color: #ec4899; word-break: break-all; font-size: 14px; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                ${verificationUrl}
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 25px;">
                <h3 style="color: #333; margin-bottom: 10px; font-size: 16px;">Por que verificar meu email?</h3>
                <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Maior segurança para sua conta</li>
                  <li>Recuperação de senha mais fácil</li>
                  <li>Notificações importantes sobre sua conta</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Este email foi enviado para ${email}. Se você não se cadastrou no Bebaby App, ignore este email.
                </p>
              </div>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      throw new Error(`Erro ao enviar email: ${res.status}`)
    }

  } catch (error) {
    console.error('Erro ao enviar email de verificação:', error)
    throw error
  }
}

async function sendEmailVerifiedConfirmation(email: string, userName: string) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email }],
        subject: 'Email Verificado - Bebaby App',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Verificado!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Parabéns, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Seu email foi verificado com sucesso! Agora você pode aproveitar todos os recursos do Bebaby App.
              </p>
              
              <div style="text-align: center; margin-bottom: 25px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
                   style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Acessar Bebaby App
                </a>
              </div>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-top: 25px; border-left: 4px solid #10b981;">
                <h3 style="color: #333; margin-bottom: 10px; font-size: 16px;">O que você pode fazer agora?</h3>
                <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Completar seu perfil</li>
                  <li>Encontrar pessoas interessantes</li>
                  <li>Enviar e receber mensagens</li>
                  <li>Participar de eventos</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px;">
                  Obrigado por escolher o Bebaby App!
                </p>
              </div>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      throw new Error(`Erro ao enviar email: ${res.status}`)
    }

  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error)
    throw error
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token e email são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar token
    const isValid = await verifyEmailToken(token)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Token válido'
    })

  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function verifyEmailToken(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gt: new Date()
        }
      }
    })

    return !!user
  } catch (error) {
    console.error('Erro ao verificar token:', error)
    return false
  }
}

// async function sendWelcomeEmail(userId: string, userData: any) {
//   try {
//     const res = await fetch('https://api.brevo.com/v3/smtp/email', {
//       method: 'POST',
//       headers: {
//         'api-key': process.env.BREVO_API_KEY!,
//         'Content-Type': 'application/json',
//         'accept': 'application/json',
//       },
//       body: JSON.stringify({
//         sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
//         to: [{ email: userData.email }],
//         subject: 'Bem-vindo ao Bebaby App!',
//         htmlContent: `<h2>Bem-vindo, ${userData.name || 'usuário'}!</h2><p>Seu cadastro foi realizado com sucesso.</p>`
//       })
//     })
//     if (!res.ok) {
//       throw new Error('Erro ao enviar e-mail de boas-vindas')
//     }
//   } catch (error) {
//     console.error('Erro ao enviar e-mail de boas-vindas:', error)
//   }
// } 