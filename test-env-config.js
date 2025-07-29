const { emailConfig } = require('./lib/email-config.ts');

async function testEnvConfig() {
  console.log('🔍 Testando configuração de ambiente...\n');

  try {
    // Testa carregamento da configuração
    const config = emailConfig.getConfig();
    const debugInfo = emailConfig.getDebugInfo();
    
    console.log('📧 Configuração de E-mail:');
    console.log('- From:', config.from);
    console.log('- API Key:', config.apiKey ? '✅ Configurada' : '❌ Não configurada');
    console.log('- Válida:', emailConfig.isValid() ? '✅ Sim' : '❌ Não');
    
    console.log('\n🔧 Informações de Debug:');
    console.log('- Config existe:', debugInfo.configExists);
    console.log('- From email:', debugInfo.fromEmail);
    console.log('- Tem API key:', debugInfo.hasApiKey);
    console.log('- Tamanho da API key:', debugInfo.apiKeyLength);
    console.log('- Número de templates:', debugInfo.templatesCount);
    
    console.log('\n📝 Templates:');
    debugInfo.templates.forEach(template => {
      console.log(`- ${template.slug}: ${template.enabled ? '✅' : '❌'} ${template.hasTemplateId ? 'ID configurado' : 'Sem ID'}`);
    });

    // Testa template específico
    const confirmationTemplate = emailConfig.getTemplate('email-confirmation');
    console.log('\n🎯 Template de Confirmação:');
    if (confirmationTemplate) {
      console.log('- Nome:', confirmationTemplate.name);
      console.log('- Habilitado:', confirmationTemplate.enabled);
      console.log('- Template ID:', confirmationTemplate.templateId || 'Não configurado');
    } else {
      console.log('❌ Template não encontrado');
    }

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testEnvConfig(); 