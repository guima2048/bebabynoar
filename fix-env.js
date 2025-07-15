const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando variáveis de ambiente...');

// Verificar se o arquivo .env.local existe
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

let envContent = '';

// Ler arquivo .env.local se existir
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Arquivo .env.local encontrado');
} else if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Arquivo .env encontrado');
} else {
  console.log('⚠️ Nenhum arquivo de ambiente encontrado, criando .env.local');
}

// Verificar se NEXTAUTH_URL está configurado corretamente
if (!envContent.includes('NEXTAUTH_URL=http://localhost:3001')) {
  console.log('🔧 Atualizando NEXTAUTH_URL para porta 3001...');
  
  // Remover linha antiga do NEXTAUTH_URL se existir
  const lines = envContent.split('\n').filter(line => 
    !line.startsWith('NEXTAUTH_URL=')
  );
  
  // Adicionar nova configuração
  lines.push('NEXTAUTH_URL=http://localhost:3001');
  
  // Salvar arquivo
  const newContent = lines.join('\n');
  fs.writeFileSync(envLocalPath, newContent);
  console.log('✅ NEXTAUTH_URL atualizado para http://localhost:3001');
} else {
  console.log('✅ NEXTAUTH_URL já está configurado corretamente');
}

// Verificar se NEXTAUTH_SECRET está configurado
if (!envContent.includes('NEXTAUTH_SECRET=')) {
  console.log('🔧 Adicionando NEXTAUTH_SECRET...');
  const secret = 'your-super-secret-key-for-development-' + Date.now();
  fs.appendFileSync(envLocalPath, `\nNEXTAUTH_SECRET=${secret}`);
  console.log('✅ NEXTAUTH_SECRET adicionado');
} else {
  console.log('✅ NEXTAUTH_SECRET já está configurado');
}

console.log('\n🎉 Configuração concluída!');
console.log('🔄 Reinicie o servidor para aplicar as mudanças:');
console.log('   npm run dev'); 