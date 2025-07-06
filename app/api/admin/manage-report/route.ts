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
        status: action === 'review' ? 'INVESTIGATING' : 'RESOLVED',
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

      // Envia e-mail de notificação para o usuário denunciado
      if (report.reported?.email) {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY!,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
            to: [{ email: report.reported.email }],
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