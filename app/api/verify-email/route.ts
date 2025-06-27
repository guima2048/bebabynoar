import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { verifyEmailSchema, validateAndSanitize, createErrorResponse } from '@/lib/schemas'
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
    const userQuery = await getDocs(
      query(
        collection(db, 'users'),
        where('email', '==', email)
      )
    )
    
    if (userQuery.empty) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userDoc = userQuery.docs[0]
    const userData = userDoc.data()

    // Verificar se o email já está verificado
    if (userData.emailVerified) {
      return NextResponse.json(
        { error: 'Email já está verificado' },
        { status: 400 }
      )
    }

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Salvar token no banco
    await updateDoc(doc(db, 'users', userDoc.id), {
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: tokenExpiry,
      lastVerificationEmailSent: serverTimestamp()
    })

    // Enviar e-mail de verificação
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`
    
    await sendVerificationEmail(email, verificationUrl, userData.name || 'Usuário')

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
    const userQuery = await getDocs(
      query(
        collection(db, 'users'),
        where('email', '==', email)
      )
    )
    
    if (userQuery.empty) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userDoc = userQuery.docs[0]
    const userData = userDoc.data()

    // Verificar se o token é válido
    if (userData.emailVerificationToken !== token) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar se o token não expirou
    if (userData.emailVerificationExpiry && userData.emailVerificationExpiry.toDate() < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Marcar email como verificado
    await updateDoc(doc(db, 'users', userDoc.id), {
      emailVerified: true,
      emailVerifiedAt: serverTimestamp(),
      emailVerificationToken: null,
      emailVerificationExpiry: null
    })

    // Enviar e-mail de confirmação
    await sendEmailVerifiedConfirmation(email, userData.name || 'Usuário')

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
                  <li>Melhor experiência no app</li>
                </ul>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
                Este link expira em 24 horas. Se você não solicitou esta verificação, ignore este email.
              </p>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de verificação:', await res.text())
      throw new Error('Falha ao enviar e-mail')
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error)
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
        subject: 'Email verificado com sucesso! - Bebaby App',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Verificado!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Parabéns, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Seu email foi verificado com sucesso! Agora você tem acesso completo ao Bebaby App.
              </p>
              
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #166534; margin-bottom: 15px;">🎉 O que você pode fazer agora:</h3>
                <ul style="color: #166534; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Completar seu perfil</li>
                  <li>Explorar outros usuários</li>
                  <li>Enviar mensagens</li>
                  <li>Participar da comunidade</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" 
                   style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Acessar Minha Conta
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
                Obrigado por escolher o Bebaby App! 🎀
              </p>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de confirmação:', await res.text())
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token de verificação é obrigatório' }, { status: 400 })
    }

    // Buscar usuário pelo token de verificação
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('emailVerificationToken', '==', token))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    // Verificar se o token não expirou (24 horas)
    const tokenCreatedAt = userData.emailVerificationTokenCreatedAt?.toDate()
    const now = new Date()
    const tokenAge = now.getTime() - tokenCreatedAt.getTime()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    if (tokenAge > maxAge) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    // Marcar email como verificado
    await updateDoc(userDoc.ref, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenCreatedAt: null,
      emailVerifiedAt: new Date(),
    })

    // Redirecionar para página de sucesso
    return NextResponse.redirect(new URL('/verify-email?success=true', req.url))

  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return NextResponse.redirect(new URL('/verify-email?error=true', req.url))
  }
} 