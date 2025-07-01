import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { resetPasswordSchema, validateAndSanitize, createErrorResponse } from '@/lib/schemas'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email.toLowerCase()))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      // Não revelar se o email existe ou não por segurança
      return NextResponse.json({ 
        success: true, 
        message: 'Se o email existir, você receberá um link para resetar sua senha' 
      })
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Salvar token no usuário
    await updateDoc(userDoc.ref, {
      passwordResetToken: resetToken,
      passwordResetTokenExpiry: resetTokenExpiry,
    })

    // Enviar email de reset se configurado
    if (process.env.BREVO_API_KEY) {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      
      const emailData = {
        to: [{ email: userData.email }],
        subject: 'Reset de Senha - Bebaby App',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ec4899;">Bebaby App</h2>
            <p>Olá ${userData.name || 'Usuário'}!</p>
            <p>Você solicitou um reset de senha para sua conta no Bebaby App.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Resetar Senha
              </a>
            </p>
            <p>Este link expira em 1 hora por motivos de segurança.</p>
            <p>Se você não solicitou este reset, ignore este email.</p>
            <p>Atenciosamente,<br>Equipe Bebaby App</p>
          </div>
        `
      }

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(emailData),
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Se o email existir, você receberá um link para resetar sua senha' 
    })

  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Buscar usuário pelo token de reset
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('passwordResetToken', '==', token))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    // Verificar se o token não expirou
    const tokenExpiry = userData.passwordResetTokenExpiry?.toDate()
    if (!tokenExpiry || new Date() > tokenExpiry) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 })
    }

    // Atualizar senha (em produção, deve ser criptografada)
    await updateDoc(userDoc.ref, {
      password: newPassword, // Em produção, usar bcrypt ou similar
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
      passwordUpdatedAt: new Date(),
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Senha atualizada com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 