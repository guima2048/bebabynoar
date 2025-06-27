import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Verificar se é uma requisição administrativa
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { userId, isPremium } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Calcular data de expiração (30 dias a partir de agora)
    const expiryDate = isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

    // Atualizar status premium
    await updateDoc(userRef, {
      isPremium,
      premiumExpiry: expiryDate,
      premiumUpdatedAt: serverTimestamp(),
    });

    // Enviar notificação por email (se configurado)
    if (process.env.BREVO_API_KEY) {
      try {
        const userData = userDoc.data();
        const emailData = {
          to: [{ email: userData.email }],
          subject: isPremium ? 'Seu plano Premium foi ativado!' : 'Seu plano Premium foi desativado',
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ec4899;">Bebaby App</h2>
              <p>Olá ${userData.name || 'Usuário'}!</p>
              <p>${isPremium 
                ? 'Seu plano Premium foi ativado com sucesso! Agora você tem acesso a todos os recursos exclusivos.' 
                : 'Seu plano Premium foi desativado. Você ainda pode reativar a qualquer momento.'}
              </p>
              ${isPremium ? `<p>Seu plano expira em: ${expiryDate?.toLocaleDateString('pt-BR')}</p>` : ''}
              <p>Agradecemos por usar o Bebaby App!</p>
            </div>
          `
        };

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
          },
          body: JSON.stringify(emailData),
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
        // Não falhar a operação se o email falhar
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Status premium ${isPremium ? 'ativado' : 'desativado'} com sucesso` 
    });

  } catch (error) {
    console.error('Erro ao alterar status premium:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 