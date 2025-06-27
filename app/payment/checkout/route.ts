import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, paymentMethod } = await req.json()

    if (!userId || !plan || !paymentMethod) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Validar plano
    const validPlans = ['basic', 'premium', 'vip']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Buscar dados do usuário
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    
    // Definir valores dos planos
    const planPrices = {
      basic: { amount: 2990, currency: 'BRL', name: 'Básico' },
      premium: { amount: 5990, currency: 'BRL', name: 'Premium' },
      vip: { amount: 9990, currency: 'BRL', name: 'VIP' }
    }

    const selectedPlan = planPrices[plan as keyof typeof planPrices]

    // Criar sessão de pagamento (Stripe)
    let paymentIntent
    try {
      // Aqui você integraria com o Stripe
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      // paymentIntent = await stripe.paymentIntents.create({
      //   amount: selectedPlan.amount,
      //   currency: selectedPlan.currency.toLowerCase(),
      //   customer: userData.stripeCustomerId,
      //   payment_method: paymentMethod,
      //   confirm: true,
      //   metadata: {
      //     userId,
      //     plan,
      //     planName: selectedPlan.name
      //   }
      // })

      // Simulação para desenvolvimento
      paymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded',
        amount: selectedPlan.amount,
        currency: selectedPlan.currency.toLowerCase()
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro ao processar pagamento' },
        { status: 500 }
      )
    }

    // Registrar tentativa de pagamento
    const paymentRecord = await addDoc(collection(db, 'payments'), {
      userId,
      plan,
      planName: selectedPlan.name,
      amount: selectedPlan.amount / 100,
      currency: selectedPlan.currency,
      paymentMethod,
      stripePaymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      createdAt: serverTimestamp()
    })

    // Se o pagamento foi bem-sucedido
    if (paymentIntent.status === 'succeeded') {
      // Atualizar status do usuário
      await updateDoc(doc(db, 'users', userId), {
        premium: true,
        premiumPlan: plan,
        premiumActivatedAt: serverTimestamp(),
        lastPaymentDate: serverTimestamp(),
        subscriptionStatus: 'active'
      })

      // Criar notificação
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'payment_success',
        title: 'Pagamento aprovado!',
        message: `Seu status ${selectedPlan.name} foi ativado com sucesso!`,
        read: false,
        createdAt: serverTimestamp()
      })

      // Enviar e-mail de confirmação
      if (userData.email) {
        await sendPaymentConfirmationEmail(userData.email, selectedPlan.name)
      }
    }

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      plan: {
        name: selectedPlan.name,
        type: plan
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function sendPaymentConfirmationEmail(email: string, planName: string) {
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
        subject: `Pagamento aprovado - Plano ${planName} ativado!`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Pagamento Aprovado!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Parabéns! Seu plano ${planName} foi ativado!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Seu pagamento foi processado com sucesso e agora você tem acesso a todos os benefícios do seu plano.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h3 style="color: #333; margin-bottom: 15px;">Benefícios do seu plano:</h3>
                <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>✅ Mensagens ilimitadas</li>
                  <li>✅ Ver quem visitou seu perfil</li>
                  <li>✅ Perfil em destaque</li>
                  <li>✅ Filtros avançados de busca</li>
                  <li>✅ Suporte prioritário</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/profile" 
                   style="background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                  Acessar Minha Conta
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 25px; text-align: center;">
                Se você tiver alguma dúvida, entre em contato conosco em suporte@bebaby.app
              </p>
            </div>
          </div>
        `
      })
    })

    if (!res.ok) {
      // Silenciar erro de e-mail para não afetar o fluxo principal
    }
  } catch (error) {
    // Silenciar erro de e-mail para não afetar o fluxo principal
  }
} 