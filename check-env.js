console.log('🔧 Verificando variáveis de ambiente...');

// Variáveis essenciais para NextAuth
const requiredVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL'
];

console.log('\n📊 Variáveis de ambiente:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`- ${varName}: ${value ? '✅ Configurada' : '❌ Não configurada'}`);
  if (value) {
    console.log(`  Valor: ${varName === 'NEXTAUTH_SECRET' ? '***' : value}`);
  }
});

console.log('\n🔍 Outras variáveis importantes:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('- PORT:', process.env.PORT || '3000 (padrão)');

// Verificar se há problemas de configuração
console.log('\n⚠️ Possíveis problemas:');
if (!process.env.NEXTAUTH_SECRET) {
  console.log('- NEXTAUTH_SECRET não está configurado');
}
if (!process.env.NEXTAUTH_URL) {
  console.log('- NEXTAUTH_URL não está configurado');
}
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('3001')) {
  console.log('- NEXTAUTH_URL pode estar apontando para porta errada (deveria ser 3001)');
}
if (!process.env.DATABASE_URL) {
  console.log('- DATABASE_URL não está configurado');
} 