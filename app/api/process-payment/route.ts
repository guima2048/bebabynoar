import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }
    const { userId, plan, paymentProof, paymentMethod, amount } = await req.json()
    
    if (!userId || !plan || !paymentProof || !paymentMethod || !amount) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Verifica se o usuário existe
    const userQuery = query(collection(db, 'users'), where('__name__', '==', userId))
    const userSnap = await getDocs(userQuery)
    
    if (userSnap.empty) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Registra o pagamento
    await addDoc(collection(db, 'payments'), {
      userId,
      plan,
      paymentProof,
      paymentMethod,
      amount,
      status: 'pending',
      createdAt: serverTimestamp(),
    })

    // Envia e-mail de confirmação para o admin
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
        subject: 'Novo comprovante de pagamento - Bebaby App',
        htmlContent: `
          <h2>Novo Comprovante de Pagamento</h2>
          <p><strong>Usuário:</strong> ${userId}</p>
          <p><strong>Plano:</strong> ${plan}</p>
          <p><strong>Valor:</strong> R$ ${amount}</p>
          <p><strong>Método:</strong> ${paymentMethod}</p>
          <p><strong>Comprovante:</strong> ${paymentProof}</p>
          <p>Acesse o dashboard administrativo para aprovar ou rejeitar o pagamento.</p>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail:', await res.text())
    }

    return NextResponse.json({ 
      success: true,
      message: 'Comprovante enviado com sucesso! Aguarde a confirmação.'
    })
  } catch (err) {
    console.error('Erro ao processar pagamento:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }
    const { paymentId, status, adminNotes } = await req.json()
    
    if (!paymentId || !status) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    // Busca o pagamento
    const paymentQuery = query(collection(db, 'payments'), where('__name__', '==', paymentId))
    const paymentSnap = await getDocs(paymentQuery)
    
    if (paymentSnap.empty) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    const payment = paymentSnap.docs[0].data()

    // Atualiza status do pagamento
    await updateDoc(doc(db, 'payments', paymentId), {
      status,
      adminNotes,
      processedAt: serverTimestamp(),
    })

    // Se aprovado, ativa o status premium do usuário
    if (status === 'approved') {
      await updateDoc(doc(db, 'users', payment.userId), {
        premium: true,
        premiumPlan: payment.plan,
        premiumActivatedAt: serverTimestamp(),
      })

      // Cria notificação de pagamento aprovado
      await addDoc(collection(db, 'notifications'), {
        userId: payment.userId,
        type: 'payment_approved',
        title: 'Pagamento aprovado!',
        message: `Seu pagamento do plano ${payment.plan} foi aprovado. Seu status Premium foi ativado com sucesso!`,
        data: {
          plan: payment.plan,
          amount: payment.amount
        },
        read: false,
        createdAt: serverTimestamp(),
      })

      // Envia e-mail de confirmação para o usuário
      const userQuery = query(collection(db, 'users'), where('__name__', '==', payment.userId))
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
            subject: 'Pagamento aprovado - Seu status Premium foi ativado!',
            htmlContent: `
              <h2>Parabéns! Seu status Premium foi ativado!</h2>
              <p>Seu pagamento foi aprovado e você agora tem acesso a todos os benefícios do plano ${payment.plan}.</p>
              <p>Acesse sua conta para aproveitar todos os recursos premium!</p>
              <p>Obrigado por escolher o Bebaby App!</p>
            `
          })
        })

        if (!res.ok) {
          console.error('Erro ao enviar e-mail de confirmação:', await res.text())
        }
      }
    } else if (status === 'rejected') {
      // Cria notificação de pagamento rejeitado
      await addDoc(collection(db, 'notifications'), {
        userId: payment.userId,
        type: 'payment_rejected',
        title: 'Pagamento rejeitado',
        message: `Seu pagamento do plano ${payment.plan} foi rejeitado. Entre em contato conosco para mais informações.`,
        data: {
          plan: payment.plan,
          amount: payment.amount,
          adminNotes
        },
        read: false,
        createdAt: serverTimestamp(),
      })

      // Envia e-mail de rejeição para o usuário
      const userQuery = query(collection(db, 'users'), where('__name__', '==', payment.userId))
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
            subject: 'Pagamento rejeitado - Bebaby App',
            htmlContent: `
              <h2>Pagamento Rejeitado</h2>
              <p>Infelizmente seu pagamento do plano ${payment.plan} foi rejeitado.</p>
              <p>Motivo: ${adminNotes || 'Não especificado'}</p>
              <p>Entre em contato conosco para esclarecimentos ou tente novamente.</p>
            `
          })
        })

        if (!res.ok) {
          console.error('Erro ao enviar e-mail de rejeição:', await res.text())
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Pagamento ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso!`
    })
  } catch (err) {
    console.error('Erro ao processar pagamento:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
} 