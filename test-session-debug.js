const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugSession() {
  console.log('🔍 Debugando sessão e autenticação...');
  
  try {
    // Verificar se o usuário existe no banco
    const user = await prisma.user.findUnique({
      where: { email: 'sugar_daddy1@example.com' },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        userType: true,
        gender: true,
        password: true,
        verified: true,
        premium: true,
        status: true
      }
    });

    if (user) {
      console.log('✅ Usuário encontrado no banco:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Username:', user.username);
      console.log('- Nome:', user.name);
      console.log('- Tipo:', user.userType);
      console.log('- Gênero:', user.gender);
      console.log('- Tem senha:', !!user.password);
      console.log('- Verificado:', user.verified);
      console.log('- Premium:', user.premium);
      console.log('- Status:', user.status);
    } else {
      console.log('❌ Usuário NÃO encontrado no banco');
    }

    // Verificar configuração do NextAuth
    console.log('\n🔧 Configuração do NextAuth:');
    console.log('- NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET);
    console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- DATABASE_URL:', !!process.env.DATABASE_URL);

    // Verificar se há problemas com o banco
    console.log('\n🔍 Testando conexão com banco...');
    const userCount = await prisma.user.count();
    console.log('- Total de usuários no banco:', userCount);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSession(); 