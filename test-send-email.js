// Teste direto de envio de email
require('dotenv').config(); // Carregar variáveis de ambiente
const fs = require('fs');
const path = require('path');

console.log('📧 TESTE DIRETO DE ENVIO DE EMAIL');
console.log('==================================');

// Carregar configuração
const configPath = path.join(process.cwd(), 'config', 'email.json');
let config = null;

try {
  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configFile);
    console.log('✅ Configuração carregada do JSON');
  }
} catch (error) {
  console.error('❌ Erro ao carregar configuração:', error.message);
}

// Verificar variáveis de ambiente
const envConfig = {
  apiKey: process.env.SENDGRID_API_KEY || '',
  from: process.env.SENDGRID_FROM || 'bebaby@bebaby.app',
  templateId: process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID || 'd-02ad9af399aa4687a4827baa6cb694f3',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
};

console.log('🌍 Configuração do ambiente:', {
  hasApiKey: !!envConfig.apiKey,
  from: envConfig.from,
  templateId: envConfig.templateId,
  appUrl: envConfig.appUrl
});

// Usar configuração do ambiente se disponível, senão usar do JSON
const finalConfig = {
  apiKey: envConfig.apiKey || config?.config?.apiKey || '',
  from: envConfig.from || config?.config?.from || 'bebaby@bebaby.app',
  templateId: envConfig.templateId || config?.templates?.['email-confirmation']?.templateId || ''
};

console.log('🔧 Configuração final:', {
  hasApiKey: !!finalConfig.apiKey,
  from: finalConfig.from,
  templateId: finalConfig.templateId
});

// Verificar se pode enviar
if (!finalConfig.apiKey) {
  console.log('❌ NÃO É POSSÍVEL ENVIAR EMAIL: API Key não configurada');
  console.log('💡 Configure a variável SENDGRID_API_KEY ou adicione no config/email.json');
  process.exit(1);
}

if (!finalConfig.templateId) {
  console.log('❌ NÃO É POSSÍVEL ENVIAR EMAIL: Template ID não configurado');
  console.log('💡 Configure a variável SENDGRID_CONFIRMATION_TEMPLATE_ID ou adicione no config/email.json');
  process.exit(1);
}

// Simular dados de teste
const testData = {
  to: 'test@example.com',
  nome: 'Usuário Teste',
  token: 'test-token-123',
  email: 'test@example.com'
};

const verificationUrl = `${finalConfig.appUrl}/verify-email?token=${testData.token}&email=${encodeURIComponent(testData.email)}`;

console.log('📧 Tentando enviar email...');
console.log('Para:', testData.to);
console.log('De:', finalConfig.from);
console.log('Template ID:', finalConfig.templateId);
console.log('URL de verificação:', verificationUrl);

// Enviar via SendGrid
const sendGridData = {
  personalizations: [
    {
      to: [{ email: testData.to }],
      dynamic_template_data: {
        nome: testData.nome,
        link_confirmacao: verificationUrl
      }
    }
  ],
  from: { email: finalConfig.from },
  template_id: finalConfig.templateId
};

console.log('📤 Dados para SendGrid:', JSON.stringify(sendGridData, null, 2));

// Fazer requisição para SendGrid
fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${finalConfig.apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(sendGridData)
})
.then(response => {
  console.log('📧 Resposta do SendGrid:');
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  console.log('OK:', response.ok);
  
  if (!response.ok) {
    return response.text().then(text => {
      console.error('❌ Erro do SendGrid:', text);
    });
  } else {
    console.log('✅ Email enviado com sucesso!');
  }
})
.catch(error => {
  console.error('❌ Erro ao enviar email:', error.message);
}); 