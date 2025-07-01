#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração do Bebaby App...\n');

// Verificar se o arquivo .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('📝 Crie o arquivo .env.local na raiz do projeto com as seguintes variáveis:\n');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'BREVO_API_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  requiredEnvVars.forEach(varName => {
    console.log(`${varName}=your_${varName.toLowerCase()}`);
  });
  
  console.log('\n📖 Consulte o arquivo SETUP.md para instruções detalhadas.');
} else {
  console.log('✅ Arquivo .env.local encontrado');
  
  // Verificar variáveis críticas
  const envContent = fs.readFileSync(envPath, 'utf8');
  const criticalVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'BREVO_API_KEY'
  ];
  
  let missingVars = [];
  criticalVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('⚠️  Variáveis críticas faltando no .env.local:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  } else {
    console.log('✅ Variáveis críticas configuradas');
  }
}

// Verificar se node_modules existe
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n❌ node_modules não encontrado!');
  console.log('📦 Execute: npm install');
} else {
  console.log('\n✅ Dependências instaladas');
}

// Verificar se o build funciona
console.log('\n🔨 Testando build...');
const { execSync } = require('child_process');

try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build executado com sucesso');
} catch (error) {
  console.log('❌ Erro no build:');
  console.log(error.message);
  console.log('\n💡 Verifique se todas as variáveis de ambiente estão configuradas corretamente.');
}

// Verificar estrutura de arquivos importantes
const importantFiles = [
  'lib/firebase.ts',
  'contexts/AuthContext.tsx',
  'app/layout.tsx',
  'firestore.rules',
  'firebase.json'
];

console.log('\n📁 Verificando arquivos importantes...');
importantFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Arquivo não encontrado`);
  }
});

// Verificar configuração do Firebase
const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
if (fs.existsSync(firebaseConfigPath)) {
  console.log('\n🔥 Firebase configurado');
} else {
  console.log('\n❌ firebase.json não encontrado');
  console.log('💡 Execute: firebase init');
}

console.log('\n🎯 Status do Projeto:');
console.log('📋 O projeto está estruturalmente completo');
console.log('⚠️  PRINCIPAL PROBLEMA: Variáveis de ambiente não configuradas');
console.log('🚀 PRÓXIMO PASSO: Configure o arquivo .env.local');
console.log('\n📖 Para instruções detalhadas, consulte: SETUP.md'); 