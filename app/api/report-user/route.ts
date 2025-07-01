import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const { reporterId, reportedId, reason, description } = await req.json()
    
    if (!reporterId || !reportedId || !reason) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // Verifica se já existe uma denúncia recente do mesmo usuário (últimas 24h)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const existingQuery = query(
      collection(db, 'denuncias'),
      where('denunciadorId', '==', reporterId),
      where('denunciadoId', '==', reportedId),
      where('dataDenuncia', '>', oneDayAgo)
    )
    const existingSnap = await getDocs(existingQuery)
    
    if (!existingSnap.empty) {
      return NextResponse.json({ error: 'Você já denunciou este usuário recentemente' }, { status: 400 })
    }

    // Busca dados do denunciador
    const reporterQuery = query(
      collection(db, 'users'),
      where('__name__', '==', reporterId)
    )
    const reporterSnap = await getDocs(reporterQuery)
    
    if (reporterSnap.empty) {
      return NextResponse.json({ error: 'Usuário denunciador não encontrado' }, { status: 404 })
    }

    const reporterData = reporterSnap.docs[0].data()
    const reporterName = reporterData.displayName || reporterData.username || reporterData.email?.split('@')[0] || 'Usuário'

    // Busca dados do denunciado
    const reportedQuery = query(
      collection(db, 'users'),
      where('__name__', '==', reportedId)
    )
    const reportedSnap = await getDocs(reportedQuery)
    
    if (reportedSnap.empty) {
      return NextResponse.json({ error: 'Usuário denunciado não encontrado' }, { status: 404 })
    }

    const reportedData = reportedSnap.docs[0].data()
    const reportedName = reportedData.displayName || reportedData.username || reportedData.email?.split('@')[0] || 'Usuário'

    // Registra a denúncia
    const denunciaData = {
      denunciadorId: reporterId,
      denunciadoId: reportedId,
      denunciadorNome: reporterName,
      denunciadoNome: reportedName,
      motivo: reason,
      descricao: description || '',
      status: 'Pendente',
      dataDenuncia: serverTimestamp(),
      revisado: false,
      revisadoPor: null,
      dataRevisao: null,
      acaoTomada: null,
    }

    const docRef = await addDoc(collection(db, 'denuncias'), denunciaData)

    // Envia e-mail para o admin
    const adminEmail = 'admin@bebaby.app'
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email: adminEmail }],
        subject: 'Nova denúncia registrada - Bebaby App',
        htmlContent: `
          <h2>Nova Denúncia Registrada</h2>
          <p><strong>Denunciador:</strong> ${reporterName} (${reporterId})</p>
          <p><strong>Denunciado:</strong> ${reportedName} (${reportedId})</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <p><strong>Descrição:</strong> ${description || 'Não fornecida'}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p>Acesse o dashboard administrativo para revisar esta denúncia.</p>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de denúncia:', await res.text())
    }

    return NextResponse.json({
      success: true,
      denunciaId: docRef.id,
      message: 'Denúncia registrada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao registrar denúncia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 