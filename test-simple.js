console.log('🔍 TESTANDO VARIÁVEIS DE AMBIENTE');
console.log('================================');

console.log('📧 SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ Não configurada');
console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Configurada' : '❌ Não configurada');
console.log('📧 NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ Configurada' : '❌ Não configurada');

if (process.env.SENDGRID_API_KEY) {
  console.log('📧 Comprimento da API Key:', process.env.SENDGRID_API_KEY.length);
} 