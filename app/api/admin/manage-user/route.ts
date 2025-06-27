import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

export async function PUT(req: NextRequest) {
  try {
    const { userId, action, adminNotes } = await req.json()
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    if (action === 'block') {
      await updateDoc(doc(db, 'users', userId), {
        ativo: false,
        bloqueadoEm: serverTimestamp(),
        motivoBloqueio: adminNotes || 'Ação administrativa',
      })
    } else if (action === 'unblock') {
      await updateDoc(doc(db, 'users', userId), {
        ativo: true,
        bloqueadoEm: null,
        motivoBloqueio: null,
      })
    } else if (action === 'activate_premium') {
      await updateDoc(doc(db, 'users', userId), {
        premium: true,
        premiumAtivadoEm: serverTimestamp(),
        premiumAtivadoPor: 'Admin',
      })
    } else if (action === 'deactivate_premium') {
      await updateDoc(doc(db, 'users', userId), {
        premium: false,
        premiumDesativadoEm: serverTimestamp(),
        premiumDesativadoPor: 'Admin',
      })
    }

    return NextResponse.json({
      success: true,
      message: `Usuário ${action === 'block' ? 'bloqueado' : action === 'unblock' ? 'desbloqueado' : action === 'activate_premium' ? 'premium ativado' : 'premium desativado'} com sucesso`
    })

  } catch (error) {
    console.error('Erro ao gerenciar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, adminNotes } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    // Marca o usuário como deletado (não remove fisicamente por segurança)
    await updateDoc(doc(db, 'users', userId), {
      deletado: true,
      deletadoEm: serverTimestamp(),
      motivoDelecao: adminNotes || 'Ação administrativa',
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário marcado como deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 