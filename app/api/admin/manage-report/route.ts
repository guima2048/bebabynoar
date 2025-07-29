import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  try {
    const { reportId, action, adminNotes } = await req.json()
    
    if (!reportId || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // Busca a denúncia
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { reported: true }
    })
    
    if (!report) {
      return NextResponse.json({ error: 'Denúncia não encontrada' }, { status: 404 })
    }

    // Atualiza o status da denúncia
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'review' ? 'PENDING' : 'RESOLVED',
      }
    })

    // Se a ação for bloquear ou excluir o usuário denunciado
    if (action === 'block_user' || action === 'delete_user') {
      if (action === 'block_user') {
        await prisma.user.update({
          where: { id: report.reportedId },
          data: {
            status: 'BANNED',
          }
        })
      } else if (action === 'delete_user') {
        // Marca o usuário como inativo (não remove fisicamente por segurança)
        await prisma.user.update({
          where: { id: report.reportedId },
          data: {
            status: 'INACTIVE',
          }
        })
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
    const { reportId } = await req.json()
    
    if (!reportId) {
      return NextResponse.json({ error: 'ID da denúncia não fornecido' }, { status: 400 })
    }

    await prisma.report.delete({
      where: { id: reportId }
    })

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