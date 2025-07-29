// Script para configurar o sistema de email
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 CONFIGURAÇÃO DO SISTEMA DE EMAIL');
console.log('====================================');
console.log('');

console.log('Para que os emails sejam enviados após o cadastro, você precisa:');
console.log('');
console.log('1. Criar uma conta no SendGrid (https://sendgrid.com)');
console.log('2. Verificar seu domínio ou email remetente');
console.log('3. Criar um template de email de confirmação');
console.log('4. Obter sua API Key');
console.log('');

console.log('📋 INSTRUÇÕES DETALHADAS:');
console.log('==========================');
console.log('');
console.log('1. Acesse https://sendgrid.com e crie uma conta gratuita');
console.log('2. Vá em Settings > Sender Authentication');
console.log('3. Verifique seu domínio (bebaby.app) ou email (bebaby@bebaby.app)');
console.log('4. Vá em Email API > Integration Guide > Web API');
console.log('5. Copie sua API Key');
console.log('6. Vá em Dynamic Templates e crie um template de confirmação');
console.log('7. Use as variáveis: {{nome}} e {{link_confirmacao}}');
console.log('8. Copie o ID do template');
console.log('');

console.log('🔧 CONFIGURAÇÃO ATUAL:');
console.log('======================');

const configPath = path.join(process.cwd(), 'config', 'email.json');
let config = null;

try {
  if (fs.existsSync(configPath)) {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configFile);
    
    console.log('📧 Email de origem:', config.config.from || 'NÃO CONFIGURADO');
    console.log('🔑 API Key:', config.config.apiKey ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
    console.log('📋 Template ID:', config.templates['email-confirmation']?.templateId || 'NÃO CONFIGURADO');
    console.log('✅ Template habilitado:', config.templates['email-confirmation']?.enabled || false);
  }
} catch (error) {
  console.error('❌ Erro ao carregar configuração:', error.message);
}

console.log('');
console.log('🌍 Variáveis de ambiente:');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
console.log('SENDGRID_FROM:', process.env.SENDGRID_FROM || 'NÃO CONFIGURADA');
console.log('SENDGRID_CONFIRMATION_TEMPLATE_ID:', process.env.SENDGRID_CONFIRMATION_TEMPLATE_ID || 'NÃO CONFIGURADA');
console.log('');

console.log('💡 SOLUÇÕES:');
console.log('============');
console.log('');
console.log('OPÇÃO 1 - Variáveis de ambiente (RECOMENDADO):');
console.log('Crie um arquivo .env.local na raiz do projeto com:');
console.log('');
console.log('SENDGRID_API_KEY=sua_api_key_aqui');
console.log('SENDGRID_FROM=bebaby@bebaby.app');
console.log('SENDGRID_CONFIRMATION_TEMPLATE_ID=seu_template_id_aqui');
console.log('NEXT_PUBLIC_APP_URL=http://localhost:3000');
console.log('');
console.log('OPÇÃO 2 - Arquivo de configuração:');
console.log('Edite o arquivo config/email.json e adicione sua API Key');
console.log('');

console.log('🚀 TESTE:');
console.log('=========');
console.log('Após configurar, execute: node test-send-email.js');
console.log('');

console.log('📞 SUPORTE:');
console.log('===========');
console.log('Se precisar de ajuda, verifique:');
console.log('- Documentação do SendGrid: https://docs.sendgrid.com');
console.log('- Templates dinâmicos: https://docs.sendgrid.com/ui/sending-email/how-to-send-an-email-with-dynamic-transactional-templates');
console.log('');

rl.close(); 