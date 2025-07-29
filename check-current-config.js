const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configurações atuais...\n');

// Verificar arquivo .env
const envPath = path.join(process.cwd(), '.env');
console.log('📁 Arquivo .env:');
if (fs.existsSync(envPath)) {
  console.log('✅ Existe');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log(`📊 ${lines.length} variáveis configuradas`);
  
  // Mostrar variáveis de e-mail
  const emailVars = lines.filter(line => 
    line.includes('SENDGRID') || 
    line.includes('EMAIL')
  );
  
  if (emailVars.length > 0) {
    console.log('\n📧 Variáveis de E-mail encontradas:');
    emailVars.forEach(line => {
      const [key, value] = line.split('=');
      const maskedValue = value && value.length > 10 ? 
        value.substring(0, 4) + '...' + value.substring(value.length - 4) : 
        value;
      console.log(`- ${key}: ${maskedValue}`);
    });
  } else {
    console.log('❌ Nenhuma variável de e-mail encontrada');
  }
} else {
  console.log('❌ Não existe');
}

// Verificar arquivo config/email.json
const configPath = path.join(process.cwd(), 'config', 'email.json');
console.log('\n📁 Arquivo config/email.json:');
if (fs.existsSync(configPath)) {
  console.log('✅ Existe');
  const configContent = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configContent);
  console.log('📊 Configurações:');
  console.log('- From:', config.config?.from || 'Não configurado');
  console.log('- API Key:', config.config?.apiKey ? 'Configurada' : 'Não configurada');
  console.log('- Templates:', Object.keys(config.templates || {}).length);
} else {
  console.log('❌ Não existe');
}

// Verificar variáveis de ambiente do processo
console.log('\n🌍 Variáveis de ambiente do processo:');
const envVars = [
  'SENDGRID_API_KEY',
  'EMAIL_FROM', 
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const maskedValue = value.length > 10 ? 
      value.substring(0, 4) + '...' + value.substring(value.length - 4) : 
      value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  } else {
    console.log(`❌ ${varName}: Não configurada`);
  }
});

console.log('\n✅ Verificação concluída!'); 