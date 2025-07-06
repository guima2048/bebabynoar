import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
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
    const { customer, amount, metadata, id, currency } = paymentIntent
    // Buscar usuário pelo customer ID
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customer } })
    if (user) {
      // Atualizar status do usuário para premium
      await prisma.user.update({
        where: { id: user.id },
        data: {
          premium: true,
          premiumExpiry: null,
          lastPaymentDate: new Date(),
        }
      })
      // Registrar pagamento
      await prisma.payment.create({
        data: {
          userId: user.id,
          stripePaymentIntentId: id,
          amount: amount / 100,
          currency: currency,
          status: 'COMPLETED',
          plan: metadata?.plan || 'basic',
        }
      })
      // Criar notificação
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PAYMENT',
          title: 'Pagamento aprovado!',
          message: 'Seu status Premium foi ativado com sucesso!',
          read: false,
        }
      })
      // Enviar e-mail de confirmação
      if (user.email) {
        await sendPaymentConfirmationEmail(user.email, metadata?.plan || 'basic')
      }
    }
  } catch (error) {
    console.error('Erro ao processar pagamento bem-sucedido:', error)
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const { customer, last_payment_error } = paymentIntent
    // Buscar usuário
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customer } })
    if (user) {
      // Criar notificação de falha
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PAYMENT',
          title: 'Falha no pagamento',
          message: `Pagamento falhou: ${last_payment_error?.message || 'Erro desconhecido'}`,
          read: false,
        }
      })
      // Enviar e-mail de falha
      if (user.email) {
        await sendPaymentFailureEmail(user.email, last_payment_error?.message)
      }
    }
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error)
  }
}

async function handleSubscriptionPayment(invoice: any) {
  try {
    const { customer, subscription, amount_paid, id, currency } = invoice
    // Buscar usuário
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customer } })
    if (user) {
      // Atualizar data do último pagamento
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastPaymentDate: new Date(),
          subscriptionStatus: 'active',
        }
      })
      // Registrar pagamento recorrente
      await prisma.payment.create({
        data: {
          userId: user.id,
          amount: amount_paid / 100,
          currency: currency,
          status: 'COMPLETED',
          plan: 'subscription',
        }
      })
    }
  } catch (error) {
    console.error('Erro ao processar pagamento de assinatura:', error)
  }
}

async function handleSubscriptionCancelled(subscription: any) {
  try {
    const { customer } = subscription
    // Buscar usuário
    const user = await prisma.user.findFirst({ where: { stripeCustomerId: customer } })
    if (user) {
      // Atualizar status de assinatura
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'cancelled',
        }
      })
      // Notificar usuário
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'PAYMENT',
          title: 'Assinatura cancelada',
          message: 'Sua assinatura foi cancelada.',
          read: false,
        }
      })
      // Enviar e-mail de cancelamento
      if (user.email) {
        await sendSubscriptionCancellationEmail(user.email)
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