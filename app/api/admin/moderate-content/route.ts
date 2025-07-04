import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

// Função para enviar e-mail
async function sendEmail({ to, subject, htmlContent }: { to: string, subject: string, htmlContent: string }) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar e-mail')
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
    throw error
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { contentId, contentType, action, adminNotes } = await req.json()
    
    if (!contentId || !contentType || !action) {
      return NextResponse.json({ 
        error: 'ID do conteúdo, tipo e ação são obrigatórios' 
      }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Ação deve ser "approve" ou "reject"' 
      }, { status: 400 })
    }

    if (!['photo', 'text'].includes(contentType)) {
      return NextResponse.json({ 
        error: 'Tipo de conteúdo deve ser "photo" ou "text"' 
      }, { status: 400 })
    }

    // Buscar o conteúdo pendente
    const contentRef = db.collection('pendingContent').doc(contentId)
    const contentSnap = await contentRef.get()
    
    if (!contentSnap.exists) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const contentData = contentSnap.data()
    const userId = contentData?.userId

    if (action === 'approve') {
      // Aprovar conteúdo
      if (contentType === 'photo') {
        // Adicionar foto ao perfil do usuário
        const userRef = db.collection('users').doc(userId)
        const userSnap = await userRef.get()
        
        if (userSnap.exists) {
          const userData = userSnap.data()
          const photos = userData?.photos || []
          
          const newPhoto = {
            id: contentId,
            url: contentData?.photoURL,
            isPrivate: contentData?.isPrivate,
            approvedAt: new Date().toISOString(),
            uploadedAt: contentData?.uploadedAt
          }
          
          await userRef.update({
            photos: [...photos, newPhoto],
            updatedAt: new Date()
          })
        }
      } else if (contentType === 'text') {
        // Atualizar texto do perfil
        const userRef = db.collection('users').doc(userId)
        const updateData: any = {
          updatedAt: new Date()
        }
        
        if (contentData?.field === 'about') {
          updateData.about = contentData?.content
        } else if (contentData?.field === 'lookingFor') {
          updateData.lookingFor = contentData?.content
        }
        
        await userRef.update(updateData)
      }

      // Enviar e-mail de aprovação
      try {
        await sendEmail({
          to: contentData?.userEmail,
          subject: 'Seu conteúdo foi aprovado! 🎉',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ec4899;">Conteúdo Aprovado!</h2>
              <p>Olá ${contentData?.userName},</p>
              <p>Seu ${contentType === 'photo' ? 'foto' : 'texto'} foi aprovado e já está visível no seu perfil!</p>
              <p><strong>Notas do administrador:</strong> ${adminNotes || 'Nenhuma'}</p>
              <p>Continue compartilhando conteúdo de qualidade!</p>
              <p>Atenciosamente,<br>Equipe Bebaby</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de aprovação:', emailError)
      }

    } else if (action === 'reject') {
      // Rejeitar conteúdo
      if (contentType === 'photo') {
        // Remover foto do storage se existir
        // TODO: Implementar remoção do Firebase Storage
      }

      // Enviar e-mail de rejeição
      try {
        await sendEmail({
          to: contentData?.userEmail,
          subject: 'Seu conteúdo precisa de ajustes',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Conteúdo Não Aprovado</h2>
              <p>Olá ${contentData?.userName},</p>
              <p>Infelizmente seu ${contentType === 'photo' ? 'foto' : 'texto'} não foi aprovado.</p>
              <p><strong>Motivo:</strong> ${adminNotes || 'Não segue as diretrizes da comunidade'}</p>
              <p>Por favor, revise as diretrizes da comunidade e tente novamente.</p>
              <p>Atenciosamente,<br>Equipe Bebaby</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de rejeição:', emailError)
      }
    }

    // Remover do conteúdo pendente
    await contentRef.delete()

    // Registrar ação de moderação
    await db.collection('moderationLog').add({
      contentId,
      contentType,
      action,
      adminNotes,
      userId,
      userName: contentData?.userName,
      moderatedAt: new Date()
    })

    return NextResponse.json({
      success: true,
      message: `Conteúdo ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro na moderação de conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { searchParams } = new URL(req.url)
    const contentType = searchParams.get('type') // 'photo' ou 'text'
    
    let q = db.collection('pendingContent').orderBy('uploadedAt', 'desc')
    
    if (contentType) {
      q = q.where('contentType', '==', contentType)
    }
    
    const snapshot = await q.get()
    const pendingContent = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json(pendingContent)
  } catch (error) {
    console.error('Erro ao buscar conteúdo pendente:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 