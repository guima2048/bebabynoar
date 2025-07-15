const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserInDB() {
  console.log('🔍 Verificando usuários no banco de dados...');
  
  try {
    // Listar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        userType: true,
        gender: true,
        createdAt: true,
        _count: {
          select: {
            photos: true
          }
        }
      },
      take: 10
    });
    
    console.log('📊 Usuários encontrados:', users.length);
    users.forEach((user, index) => {
      console.log(`👤 Usuário ${index + 1}:`, {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        userType: user.userType,
        gender: user.gender,
        photos: user._count.photos,
        createdAt: user.createdAt
      });
    });
    
    // Verificar se há usuários com dados mínimos
    const usersWithMinData = await prisma.user.findMany({
      where: {
        AND: [
          { username: { not: null } },
          { email: { not: null } },
          { userType: { not: null } },
          { gender: { not: null } }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        userType: true,
        gender: true
      }
    });
    
    console.log('✅ Usuários com dados mínimos:', usersWithMinData.length);
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserInDB(); 