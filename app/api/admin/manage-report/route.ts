import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, collection } from 'firebase/firestore'

export async function PUT(req: NextRequest) {
  try {
    // Verificar se o Firebase está inicializado
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' }, { status: 500 })
    }

    const { reportId, action, adminNotes } = await req.json()
    
    if (!reportId || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // Busca a denúncia
    const reportQuery = query(
      collection(db, 'denuncias'),
      where('__name__', '==', reportId)
    )
    const reportSnap = await getDocs(reportQuery)
    
    if (reportSnap.empty) {
      return NextResponse.json({ error: 'Denúncia não encontrada' }, { status: 404 })
    }

    const report = reportSnap.docs[0].data()

    // Atualiza o status da denúncia
    await updateDoc(doc(db, 'denuncias', reportId), {
      status: action === 'review' ? 'Em Revisão' : 'Resolvida',
      revisado: true,
      revisadoPor: 'Admin',
      dataRevisao: serverTimestamp(),
      acaoTomada: action,
      adminNotes: adminNotes || null,
    })

    // Se a ação for bloquear ou excluir o usuário denunciado
    if (action === 'block_user' || action === 'delete_user') {
      if (action === 'block_user') {
        await updateDoc(doc(db, 'users', report.denunciadoId), {
          ativo: false,
          bloqueadoEm: serverTimestamp(),
          motivoBloqueio: adminNotes || 'Denúncia de usuário',
        })
      } else if (action === 'delete_user') {
        // Marca o usuário como deletado (não remove fisicamente por segurança)
        await updateDoc(doc(db, 'users', report.denunciadoId), {
          deletado: true,
          deletadoEm: serverTimestamp(),
          motivoDelecao: adminNotes || 'Denúncia de usuário',
        })
      }

      // Envia e-mail de notificação para o usuário denunciado
      const userQuery = query(
        collection(db, 'users'),
        where('__name__', '==', report.denunciadoId)
      )
      const userSnap = await getDocs(userQuery)
      
      if (!userSnap.empty) {
        const userEmail = userSnap.docs[0].data().email
        
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY!,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
            to: [{ email: userEmail }],
            subject: action === 'block_user' ? 'Conta bloqueada - Bebaby App' : 'Conta removida - Bebaby App',
            htmlContent: `
              <h2>${action === 'block_user' ? 'Sua conta foi bloqueada' : 'Sua conta foi removida'}</h2>
              <p>Olá,</p>
              <p>${action === 'block_user' ? 'Sua conta no Bebaby App foi bloqueada' : 'Sua conta no Bebaby App foi removida'} devido a uma denúncia de outro usuário.</p>
              <p><strong>Motivo:</strong> ${adminNotes || 'Violação das diretrizes da comunidade'}</p>
              <p>Se você acredita que isso foi um erro, entre em contato conosco.</p>
              <p>Atenciosamente,<br>Equipe Bebaby App</p>
            `
          })
        })

        if (!res.ok) {
          console.error('Erro ao enviar e-mail de notificação:', await res.text())
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Denúncia ${action === 'review' ? 'marcada como em revisão' : 'resolvida'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao gerenciar denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verificar se o Firebase está inicializado
    if (!db) {
      return NextResponse.json({ error: 'Firebase não inicializado' }, { status: 500 })
    }

    const { reportId } = await req.json()
    
    if (!reportId) {
      return NextResponse.json({ error: 'ID da denúncia não fornecido' }, { status: 400 })
    }

    await deleteDoc(doc(db, 'denuncias', reportId))

    return NextResponse.json({
      success: true,
      message: 'Denúncia excluída com sucesso'
    })

  } catch (error) {
    console.error('Erro ao excluir denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 