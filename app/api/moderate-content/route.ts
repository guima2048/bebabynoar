import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { contentId, contentType, action, reason, moderatorId } = await request.json()

    if (!contentId || !contentType || !action || !moderatorId) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // Verificar se o moderador existe e tem permissão
    const moderatorRef = doc(db, 'users', moderatorId)
    const moderatorDoc = await getDoc(moderatorRef)

    if (!moderatorDoc.exists() || !moderatorDoc.data().isAdmin) {
      return NextResponse.json({ error: 'Sem permissão para moderar conteúdo' }, { status: 403 })
    }

    // Buscar o conteúdo baseado no tipo
    let contentRef
    switch (contentType) {
      case 'profile':
        contentRef = doc(db, 'users', contentId)
        break
      case 'photo':
        contentRef = doc(db, 'photos', contentId)
        break
      case 'message':
        contentRef = doc(db, 'messages', contentId)
        break
      case 'blog':
        contentRef = doc(db, 'blog', contentId)
        break
      default:
        return NextResponse.json({ error: 'Tipo de conteúdo inválido' }, { status: 400 })
    }

    const contentDoc = await getDoc(contentRef)
    if (!contentDoc.exists()) {
      return NextResponse.json({ error: 'Conteúdo não encontrado' }, { status: 404 })
    }

    const contentData = contentDoc.data()

    // Aplicar ação de moderação
    switch (action) {
      case 'approve':
        await updateDoc(contentRef, {
          moderationStatus: 'approved',
          moderatedAt: new Date(),
          moderatedBy: moderatorId,
          moderationReason: reason || null,
        })
        break

      case 'reject':
        await updateDoc(contentRef, {
          moderationStatus: 'rejected',
          moderatedAt: new Date(),
          moderatedBy: moderatorId,
          moderationReason: reason || 'Conteúdo não aprovado',
        })
        break

      case 'flag':
        await updateDoc(contentRef, {
          moderationStatus: 'flagged',
          flaggedAt: new Date(),
          flaggedBy: moderatorId,
          flagReason: reason || 'Conteúdo sinalizado para revisão',
        })
        break

      case 'delete':
        // Marcar como deletado (soft delete)
        await updateDoc(contentRef, {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: moderatorId,
          deletionReason: reason || 'Conteúdo removido por violação',
        })
        break

      default:
        return NextResponse.json({ error: 'Ação de moderação inválida' }, { status: 400 })
    }

    // Registrar ação de moderação
    await addDoc(collection(db, 'moderationLog'), {
      contentId,
      contentType,
      action,
      reason,
      moderatorId,
      moderatorName: moderatorDoc.data().name,
      contentOwnerId: contentData.userId || contentData.id,
      createdAt: new Date(),
      previousStatus: contentData.moderationStatus || 'pending',
      newStatus: action === 'approve' ? 'approved' : 
                action === 'reject' ? 'rejected' : 
                action === 'flag' ? 'flagged' : 'deleted',
    })

    // Notificar o usuário se o conteúdo foi rejeitado ou deletado
    if (action === 'reject' || action === 'delete') {
      const userRef = doc(db, 'users', contentData.userId || contentData.id)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists() && process.env.BREVO_API_KEY) {
        const userData = userDoc.data()
        const actionText = action === 'reject' ? 'rejeitado' : 'removido'
        
        const emailData = {
          to: [{ email: userData.email }],
          subject: `Seu conteúdo foi ${actionText} - Bebaby App`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ec4899;">Bebaby App</h2>
              <p>Olá ${userData.name || 'Usuário'}!</p>
              <p>Seu conteúdo foi ${actionText} por nossa equipe de moderação.</p>
              <p><strong>Motivo:</strong> ${reason || 'Violação das diretrizes da comunidade'}</p>
              <p>Se você acredita que isso foi um erro, entre em contato conosco.</p>
              <p>Atenciosamente,<br>Equipe de Moderação - Bebaby App</p>
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
    }

    return NextResponse.json({ 
      success: true, 
      message: `Conteúdo ${action === 'approve' ? 'aprovado' : 
                action === 'reject' ? 'rejeitado' : 
                action === 'flag' ? 'sinalizado' : 'deletado'} com sucesso` 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const contentType = searchParams.get('type') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Buscar conteúdo pendente de moderação
    let contentQuery = collection(db, 'users') // Começar com usuários
    
    if (contentType !== 'all') {
      contentQuery = collection(db, contentType === 'profile' ? 'users' : contentType)
    }

    const q = query(
      contentQuery,
      where('moderationStatus', '==', status),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const content = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      contentType: contentType === 'all' ? 'profile' : contentType,
    }))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedContent = content.slice(startIndex, endIndex)

    return NextResponse.json({
      content: paginatedContent,
      pagination: {
        page,
        limit,
        total: content.length,
        totalPages: Math.ceil(content.length / limit),
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 