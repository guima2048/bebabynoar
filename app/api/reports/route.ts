import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB, collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from '@/lib/firebase'
import { query, where, getDocs, orderBy, limit } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { reporterId, reportedUserId, reason, description } = await req.json()

    if (!reporterId || !reportedUserId || !reason) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se já existe um relatório similar recente
    const existingReport = await getDocs(
      query(
        collection(db, 'reports'),
        where('reporterId', '==', reporterId),
        where('reportedUserId', '==', reportedUserId),
        where('status', 'in', ['pending', 'investigating'])
      )
    )

    if (!existingReport.empty) {
      return NextResponse.json(
        { error: 'Você já reportou este usuário recentemente' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário reportado
    const reportedUserDoc = await getDoc(doc(db, 'users', reportedUserId))
    if (!reportedUserDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário reportado não encontrado' },
        { status: 404 }
      )
    }

    const reportedUserData = reportedUserDoc.data()

    // Criar relatório
    const reportData = {
      reporterId,
      reportedUserId,
      reportedUserEmail: reportedUserData.email,
      reportedUserName: reportedUserData.name,
      reason,
      description: description || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const reportRef = await addDoc(collection(db, 'reports'), reportData)

    // Atualizar contador de relatórios do usuário reportado
    await updateDoc(doc(db, 'users', reportedUserId), {
      reportCount: (reportedUserData.reportCount || 0) + 1,
      lastReportedAt: serverTimestamp()
    })

    // Notificar moderadores se for alta prioridade
    if (getReportPriority(reason) === 'high') {
      await notifyModerators(reportRef.id, reportedUserData.name, reason)
    }

    // Enviar confirmação para o usuário que reportou
    await sendReportConfirmation(reporterId, reportedUserData.name, reason)

    return NextResponse.json({
      success: true,
      reportId: reportRef.id,
      message: 'Relatório enviado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao criar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Buscar relatórios (para admin)
export async function GET(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const reportsSnapshot = await getDocs(
      query(
        collection(db, 'reports'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
    )

    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }))

    return NextResponse.json({
      success: true,
      reports,
      total: reports.length
    })

  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Atualizar status do relatório (para admin)
export async function PUT(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { reportId, status, moderatorNotes, action } = await req.json()

    if (!reportId || !status) {
      return NextResponse.json(
        { error: 'ID do relatório e status são obrigatórios' },
        { status: 400 }
      )
    }

    const reportDoc = await getDoc(doc(db, 'reports', reportId))
    if (!reportDoc.exists()) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    const reportData = reportDoc.data()

    // Atualizar relatório
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      moderatorNotes: moderatorNotes || '',
      resolvedAt: status === 'resolved' ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    })

    // Aplicar ação se especificada
    if (action && reportData.reportedUserId) {
      await applyReportAction(reportData.reportedUserId, action, reportData.reason)
    }

    // Notificar usuário que reportou
    if (status === 'resolved') {
      await notifyReporter(reportData.reporterId, status, moderatorNotes)
    }

    return NextResponse.json({
      success: true,
      message: 'Relatório atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function getReportPriority(reason: string): string {
  const highPriorityReasons = [
    'harassment',
    'inappropriate_content',
    'fake_profile',
    'spam',
    'scam',
    'underage'
  ]

  const mediumPriorityReasons = [
    'inappropriate_behavior',
    'misleading_information',
    'multiple_accounts'
  ]

  if (highPriorityReasons.includes(reason)) {
    return 'high'
  } else if (mediumPriorityReasons.includes(reason)) {
    return 'medium'
  } else {
    return 'low'
  }
}

async function notifyModerators(reportId: string, reportedUserName: string, reason: string) {
  try {
    const db = getFirestoreDB()
    
    // Buscar moderadores ativos
    const moderatorsQuery = await getDocs(
      query(
        collection(db, 'users'),
        where('role', '==', 'moderator'),
        where('active', '==', true)
      )
    )

    const moderators = moderatorsQuery.docs.map(doc => doc.data())

    // Enviar notificação para cada moderador
    for (const moderator of moderators) {
      await addDoc(collection(db, 'notifications'), {
        userId: moderator.id,
        type: 'high_priority_report',
        title: 'Relatório de Alta Prioridade',
        message: `Novo relatório urgente sobre ${reportedUserName}: ${reason}`,
        data: {
          reportId,
          reportedUserName,
          reason
        },
        read: false,
        createdAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Erro ao notificar moderadores:', error)
  }
}

async function sendReportConfirmation(reporterId: string, reportedUserName: string, reason: string) {
  try {
    const db = getFirestoreDB()
    await addDoc(collection(db, 'notifications'), {
      userId: reporterId,
      type: 'report_confirmation',
      title: 'Relatório Enviado',
      message: `Seu relatório sobre ${reportedUserName} foi recebido e está sendo analisado.`,
      read: false,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao enviar confirmação:', error)
  }
}

async function applyReportAction(userId: string, action: string, reason: string) {
  try {
    const db = getFirestoreDB()
    const userRef = doc(db, 'users', userId)

    switch (action) {
      case 'warn':
        await updateDoc(userRef, {
          warnings: (await getDoc(userRef)).data()?.warnings || 0 + 1,
          lastWarningAt: serverTimestamp()
        })
        break

      case 'suspend':
        const suspendUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        await updateDoc(userRef, {
          suspended: true,
          suspendedUntil: suspendUntil,
          suspensionReason: reason
        })
        break

      case 'ban':
        await updateDoc(userRef, {
          banned: true,
          bannedAt: serverTimestamp(),
          banReason: reason
        })
        break

      case 'delete':
        await updateDoc(userRef, {
          deleted: true,
          deletedAt: serverTimestamp(),
          deletionReason: reason
        })
        break
    }

    // Notificar usuário sobre a ação
    await notifyUserAction(userId, action, reason)

  } catch (error) {
    console.error('Erro ao aplicar ação:', error)
  }
}

async function notifyReporter(reporterId: string, status: string, moderatorNotes: string) {
  try {
    const db = getFirestoreDB()
    
    const message = status === 'resolved' 
      ? 'Seu relatório foi analisado e uma ação foi tomada.'
      : 'Seu relatório foi atualizado.'

    await addDoc(collection(db, 'notifications'), {
      userId: reporterId,
      type: 'report_update',
      title: 'Relatório Atualizado',
      message: `${message} ${moderatorNotes ? `Nota: ${moderatorNotes}` : ''}`,
      read: false,
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao notificar reporter:', error)
  }
}

async function notifyUserAction(userId: string, action: string, reason: string) {
  try {
    const db = getFirestoreDB()
    
    const actionMessages = {
      warn: 'Você recebeu um aviso por violar nossas diretrizes.',
      suspend: 'Sua conta foi suspensa temporariamente por violar nossas diretrizes.',
      ban: 'Sua conta foi banida permanentemente por violar nossas diretrizes.',
      delete: 'Sua conta foi removida por violar nossos termos de uso.'
    }

    await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'account_action',
      title: 'Ação na Conta',
      message: actionMessages[action as keyof typeof actionMessages] || 'Uma ação foi tomada em sua conta.',
      data: {
        action,
        reason
      },
      read: false,
      createdAt: serverTimestamp()
    })

    // Enviar e-mail para ações graves
    if (action === 'suspend' || action === 'ban' || action === 'delete') {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        await sendAccountActionEmail(userData.email, action, reason)
      }
    }

  } catch (error) {
    console.error('Erro ao notificar ação do usuário:', error)
  }
}

async function sendAccountActionEmail(email: string, action: string, reason: string) {
  try {
    const actionTitles = {
      warn: 'Aviso na Conta',
      suspend: 'Conta Suspensa',
      ban: 'Conta Banida',
      delete: 'Conta Removida'
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'moderacao@bebaby.app' },
        to: [{ email }],
        subject: `${actionTitles[action as keyof typeof actionTitles]} - Bebaby App`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ ${actionTitles[action as keyof typeof actionTitles]}</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Ação na Sua Conta</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Sua conta no Bebaby App recebeu uma ação devido a violação de nossas diretrizes da comunidade.
              </p>
              
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #991b1b; margin-bottom: 15px;">Detalhes da Ação:</h3>
                <ul style="color: #991b1b; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li><strong>Ação:</strong> ${actionTitles[action as keyof typeof actionTitles]}</li>
                  <li><strong>Motivo:</strong> ${reason}</li>
                  <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Para evitar futuras violações, revise nossas diretrizes da comunidade.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms" 
                   style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Ver Diretrizes
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
                Se você acredita que isso foi um erro, entre em contato conosco em suporte@bebaby.app
              </p>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de ação:', await res.text())
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail de ação:', error)
  }
} 