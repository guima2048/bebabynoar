const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkAdminUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando usuários admin...');
    
    // Buscar usuários admin
    const adminUsers = await prisma.user.findMany({
      where: {
        isAdmin: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isAdmin: true,
        verified: true
      }
    });
    
    console.log('👥 Usuários admin encontrados:', adminUsers.length);
    
    if (adminUsers.length === 0) {
      console.log('❌ Nenhum usuário admin encontrado. Criando usuário admin padrão...');
      
      const hashedPassword = await bcrypt.hash(process.env.TEST_ADMIN_PASSWORD || 'admin123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@bebaby.app',
          name: 'Administrador',
          password: hashedPassword,
          isAdmin: true,
          verified: true,
          emailVerified: true,
          birthdate: new Date('1990-01-01'),
          gender: 'OTHER',
          userType: 'SUGAR_BABY',
          state: 'SP',
          city: 'São Paulo',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Usuário admin criado:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email
      });
      console.log('🔑 Credenciais: admin / admin123');
      
    } else {
      console.log('✅ Usuários admin existentes:');
      adminUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.verified ? 'Verificado' : 'Não verificado'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers(); 