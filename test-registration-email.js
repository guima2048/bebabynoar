// Simular o processo de registro e envio de email
const fs = require('fs');
const path = require('path');

console.log('🔍 SIMULANDO PROCESSO DE REGISTRO E EMAIL');
console.log('==========================================');

// Simular carregamento da configuração de email
function loadEmailConfig() {
  const configPath = path.join(process.cwd(), 'config', 'email.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configFile);
      console.log('✅ Configuração JSON carregada:', {
        from: config.config.from || 'NÃO CONFIGURADO',
        hasApiKey: !!config.config.apiKey,
        apiKeyLength: config.config.apiKey ? config.config.apiKey.length : 0
      });
      
      console.log('📋 Template email-confirmation:', {
        exists: !!config.templates['email-confirmation'],
        enabled: config.templates['email-confirmation']?.enabled || false,
        hasTemplateId: !!(config.templates['email-confirmation']?.templateId),
        templateId: config.templates['email-confirmation']?.templateId || 'NÃO CONFIGURADO'
      });
      
      return config;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar configuração JSON:', error.message);
  }
  
  return null;
}

// Verificar variáveis de ambiente
console.log('🌍 Variáveis de ambiente:', {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
  SENDGRID_FROM: process.env.SENDGRID_FROM || 'NÃO CONFIGURADO',
  SENDGRID_CONFIRMATION_TEMPLATE_ID: process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID || 'NÃO CONFIGURADO',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NÃO CONFIGURADO'
});

// Carregar configuração
const config = loadEmailConfig();

// Simular condições do código de registro
const emailTemplate = config?.templates['email-confirmation'];
const emailConfig = config?.config;

console.log('\n🔍 CONDIÇÕES PARA ENVIO DE EMAIL:');
console.log('==================================');
console.log('1. Template existe:', !!emailTemplate);
console.log('2. Template habilitado:', emailTemplate?.enabled || false);
console.log('3. Template tem ID:', !!(emailTemplate?.templateId));
console.log('4. Config existe:', !!emailConfig);
console.log('5. Config tem API Key:', !!(emailConfig?.apiKey));
console.log('6. Config tem email de origem:', !!(emailConfig?.from));

const shouldSendEmail = emailTemplate && 
                       emailTemplate.enabled && 
                       emailTemplate.templateId && 
                       emailConfig &&
                       emailConfig.apiKey &&
                       emailConfig.from;

console.log('\n📧 EMAIL SERÁ ENVIADO?', shouldSendEmail ? 'SIM' : 'NÃO');

if (!shouldSendEmail) {
  console.log('\n❌ MOTIVOS PARA NÃO ENVIAR:');
  if (!emailTemplate) console.log('- Template não encontrado');
  if (!emailTemplate?.enabled) console.log('- Template desabilitado');
  if (!emailTemplate?.templateId) console.log('- Template sem ID');
  if (!emailConfig) console.log('- Configuração não encontrada');
  if (!emailConfig?.apiKey) console.log('- API Key não configurada');
  if (!emailConfig?.from) console.log('- Email de origem não configurado');
}

console.log('\n💡 SOLUÇÃO:');
console.log('Configure as seguintes variáveis de ambiente:');
console.log('- SENDGRID_API_KEY: Sua chave API do SendGrid');
console.log('- SENDGRID_FROM: Email verificado no SendGrid (ex: bebaby@bebaby.app)');
console.log('- SENDGRID_CONFIRMATION_TEMPLATE_ID: ID do template de confirmação');
console.log('- NEXT_PUBLIC_APP_URL: URL da aplicação (ex: http://localhost:3000)'); 