// Teste de reenvio de e-mail
async function testResendEmail() {
  try {
    console.log('🧪 Testando reenvio de e-mail...');
    
    // Substitua pelo email de um usuário não verificado
    const testEmail = 'teste@exemplo.com';
    
    const response = await fetch('http://localhost:3000/api/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const data = await response.json();
    
    console.log('📧 Resposta do reenvio:', {
      status: response.status,
      success: data.success,
      message: data.message,
      error: data.error
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testResendEmail(); 