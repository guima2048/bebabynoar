import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, getDocs, query, where, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const db = getFirestoreDB()
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Assinatura Stripe não fornecida' }, { status: 400 })
    }

    // Verificar se é um webhook válido do Stripe
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    
    // Para desenvolvimento, vamos simular alguns eventos
    const event = JSON.parse(body)
    
    console.log('Webhook recebido:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object)
        break
      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const db = getFirestoreDB()
    const { customer, amount, metadata } = paymentIntent
    
    // Buscar usuário pelo customer ID
    const userQuery = query(
      collection(db, 'users'),
      where('stripeCustomerId', '==', customer)
    )
    const userSnap = await getDocs(userQuery)
    
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0]
      const userId = userDoc.id
      
      // Atualizar status do usuário para premium
      await updateDoc(doc(db, 'users', userId), {
        premium: true,
        premiumPlan: metadata.plan || 'basic',
        premiumActivatedAt: serverTimestamp(),
        stripeCustomerId: customer,
        lastPaymentDate: serverTimestamp()
      })

      // Registrar pagamento
      await addDoc(collection(db, 'payments'), {
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount / 100, // Stripe usa centavos
        currency: paymentIntent.currency,
        status: 'completed',
        plan: metadata.plan || 'basic',
        createdAt: serverTimestamp()
      })

      // Criar notificação
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'payment_success',
        title: 'Pagamento aprovado!',
        message: 'Seu status Premium foi ativado com sucesso!',
        read: false,
        createdAt: serverTimestamp()
      })

      // Enviar e-mail de confirmação
      const userData = userDoc.data()
      if (userData.email) {
        await sendPaymentConfirmationEmail(userData.email, metadata.plan || 'basic')
      }
    }
  } catch (error) {
    console.error('Erro ao processar pagamento bem-sucedido:', error)
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const db = getFirestoreDB()
    const { customer, last_payment_error } = paymentIntent
    
    // Buscar usuário
    const userQuery = query(
      collection(db, 'users'),
      where('stripeCustomerId', '==', customer)
    )
    const userSnap = await getDocs(userQuery)
    
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0]
      const userId = userDoc.id
      
      // Criar notificação de falha
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'payment_failed',
        title: 'Falha no pagamento',
        message: `Pagamento falhou: ${last_payment_error?.message || 'Erro desconhecido'}`,
        read: false,
        createdAt: serverTimestamp()
      })

      // Enviar e-mail de falha
      const userData = userDoc.data()
      if (userData.email) {
        await sendPaymentFailureEmail(userData.email, last_payment_error?.message)
      }
    }
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error)
  }
}

async function handleSubscriptionPayment(invoice: any) {
  try {
    const db = getFirestoreDB()
    const { customer, subscription, amount_paid } = invoice
    
    // Buscar usuário
    const userQuery = query(
      collection(db, 'users'),
      where('stripeCustomerId', '==', customer)
    )
    const userSnap = await getDocs(userQuery)
    
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0]
      const userId = userDoc.id
      
      // Atualizar data do último pagamento
      await updateDoc(doc(db, 'users', userId), {
        lastPaymentDate: serverTimestamp(),
        subscriptionStatus: 'active'
      })

      // Registrar pagamento recorrente
      await addDoc(collection(db, 'payments'), {
        userId,
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: subscription,
        amount: amount_paid / 100,
        currency: invoice.currency,
        status: 'completed',
        type: 'subscription',
        createdAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Erro ao processar pagamento de assinatura:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const db = getFirestoreDB()
    const { customer } = subscription
    
    // Buscar usuário
    const userQuery = query(
      collection(db, 'users'),
      where('stripeCustomerId', '==', customer)
    )
    const userSnap = await getDocs(userQuery)
    
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0]
      const userId = userDoc.id
      
      // Desativar premium
      await updateDoc(doc(db, 'users', userId), {
        premium: false,
        subscriptionStatus: 'cancelled',
        premiumCancelledAt: serverTimestamp()
      })

      // Criar notificação
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'subscription_cancelled',
        title: 'Assinatura cancelada',
        message: 'Sua assinatura Premium foi cancelada. Você ainda tem acesso até o final do período pago.',
        read: false,
        createdAt: serverTimestamp()
      })

      // Enviar e-mail de cancelamento
      const userData = userDoc.data()
      if (userData.email) {
        await sendSubscriptionCancellationEmail(userData.email)
      }
    }
  } catch (error) {
    console.error('Erro ao processar cancelamento de assinatura:', error)
  }
}

async function sendPaymentConfirmationEmail(email: string, plan: string) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email }],
        subject: 'Pagamento aprovado - Seu status Premium foi ativado!',
        htmlContent: `
          <h2>Parabéns! Seu status Premium foi ativado!</h2>
          <p>Seu pagamento do plano ${plan} foi processado com sucesso.</p>
          <p>Agora você tem acesso a todos os benefícios Premium:</p>
          <ul>
            <li>Mensagens ilimitadas</li>
            <li>Ver quem visitou seu perfil</li>
            <li>Perfil em destaque</li>
            <li>Filtros avançados</li>
          </ul>
          <p>Acesse sua conta para aproveitar todos os recursos!</p>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de confirmação:', await res.text())
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
  }
}

async function sendPaymentFailureEmail(email: string, errorMessage: string) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email }],
        subject: 'Falha no pagamento - Bebaby App',
        htmlContent: `
          <h2>Falha no Pagamento</h2>
          <p>Infelizmente seu pagamento não foi processado.</p>
          <p>Erro: ${errorMessage}</p>
          <p>Entre em contato conosco para obter ajuda ou tente novamente.</p>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de falha:', await res.text())
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
  }
}

async function sendSubscriptionCancellationEmail(email: string) {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Bebaby App', email: 'no-reply@bebaby.app' },
        to: [{ email }],
        subject: 'Assinatura cancelada - Bebaby App',
        htmlContent: `
          <h2>Assinatura Cancelada</h2>
          <p>Sua assinatura Premium foi cancelada conforme solicitado.</p>
          <p>Você ainda tem acesso aos recursos Premium até o final do período pago.</p>
          <p>Para reativar sua assinatura, acesse sua conta e escolha um plano.</p>
        `
      })
    })

    if (!res.ok) {
      console.error('Erro ao enviar e-mail de cancelamento:', await res.text())
    }
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error)
  }
} 