// Carregar variáveis de ambiente
require('dotenv').config();

// Importar o módulo de configuração
const { emailConfig } = require('./lib/email-config');

console.log('🔍 TESTANDO CONFIGURAÇÃO DE EMAIL');
console.log('================================');

// Verificar configuração
const config = emailConfig.getConfig();
console.log('📧 Configuração:', {
  from: config.from,
  hasApiKey: !!config.apiKey,
  apiKeyLength: config.apiKey ? config.apiKey.length : 0
});

// Verificar templates
const templates = emailConfig.getAllTemplates();
console.log('📋 Templates:', Object.keys(templates).map(key => ({
  slug: key,
  enabled: templates[key].enabled,
  hasTemplateId: !!templates[key].templateId,
  templateId: templates[key].templateId
})));

// Verificar se está válido
console.log('✅ Configuração válida:', emailConfig.isValid());

// Informações de debug
console.log('🔧 Debug info:', emailConfig.getDebugInfo()); 