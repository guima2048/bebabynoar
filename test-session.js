const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSession() {
  console.log('🧪 Testando sessão do NextAuth...');
  
  try {
    // Verificar se há usuários no banco
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        userType: true,
        gender: true
      },
      take: 3
    });
    
    console.log('📊 Usuários no banco:', users.length);
    users.forEach((user, index) => {
      console.log(`👤 Usuário ${index + 1}:`, {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        userType: user.userType,
        gender: user.gender
      });
    });
    
    // Verificar configuração do NextAuth
    console.log('🔧 Configuração do NextAuth:');
    console.log('- Secret configurado:', !!process.env.NEXTAUTH_SECRET);
    console.log('- NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
  } catch (error) {
    console.error('❌ Erro ao testar sessão:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSession(); 