// Teste simples do sistema de email
const { emailConfig } = require('./lib/email-config');

console.log('🔍 TESTANDO SISTEMA DE EMAIL');
console.log('============================');

// Verificar configuração
const config = emailConfig.getConfig();
console.log('📧 Configuração:', {
  from: config.from || 'NÃO CONFIGURADO',
  hasApiKey: !!config.apiKey,
  apiKeyLength: config.apiKey ? config.apiKey.length : 0
});

// Verificar template
const template = emailConfig.getTemplate('email-confirmation');
console.log('📋 Template email-confirmation:', {
  exists: !!template,
  enabled: template?.enabled || false,
  hasTemplateId: !!(template?.templateId),
  templateId: template?.templateId || 'NÃO CONFIGURADO'
});

// Verificar se está válido
console.log('✅ Configuração válida:', emailConfig.isValid());

// Informações de debug
console.log('🔧 Debug info:', emailConfig.getDebugInfo());

// Verificar variáveis de ambiente
console.log('🌍 Variáveis de ambiente:', {
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY ? 'CONFIGURADO' : 'NÃO CONFIGURADO',
  SENDGRID_FROM: process.env.SENDGRID_FROM || 'NÃO CONFIGURADO',
  SENDGRID_CONFIRMATION_TEMPLATE_ID: process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID || 'NÃO CONFIGURADO',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NÃO CONFIGURADO'
}); 