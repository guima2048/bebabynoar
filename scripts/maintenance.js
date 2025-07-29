const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function maintenanceCheck() {
  try {
    console.log('🔧 Executando verificação de manutenção...');
    
    // 1. Verificar usuários com inconsistência verified/emailVerified
    const inconsistentUsers = await prisma.user.findMany({
      where: {
        verified: true,
        emailVerified: false
      },
      select: {
        id: true,
        email: true,
        verified: true,
        emailVerified: true
      }
    });
    
    if (inconsistentUsers.length > 0) {
      console.log(`⚠️ Encontrados ${inconsistentUsers.length} usuários com inconsistência`);
      
      for (const user of inconsistentUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        });
        console.log(`✅ Corrigido: ${user.email}`);
      }
    } else {
      console.log('✅ Nenhuma inconsistência encontrada');
    }
    
    // 2. Verificar usuários sem senha
    const usersWithoutPassword = await prisma.user.findMany({
      where: {
        password: null
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    if (usersWithoutPassword.length > 0) {
      console.log(`⚠️ Encontrados ${usersWithoutPassword.length} usuários sem senha`);
      usersWithoutPassword.forEach(user => {
        console.log(`   - ${user.email} (criado em: ${user.createdAt.toLocaleDateString()})`);
      });
    }
    
    // 3. Verificar usuários inativos (último login > 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastActive: {
          lt: thirtyDaysAgo
        },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        lastActive: true
      }
    });
    
    if (inactiveUsers.length > 0) {
      console.log(`⚠️ Encontrados ${inactiveUsers.length} usuários inativos (>30 dias)`);
      // Opcional: marcar como inativo
      // await prisma.user.updateMany({
      //   where: { id: { in: inactiveUsers.map(u => u.id) } },
      //   data: { status: 'INACTIVE' }
      // });
    }
    
    // 4. Estatísticas gerais
    const stats = await prisma.user.groupBy({
      by: ['emailVerified'],
      _count: {
        emailVerified: true
      }
    });
    
    console.log('\n📊 Estatísticas:');
    stats.forEach(stat => {
      console.log(`   - emailVerified=${stat.emailVerified}: ${stat._count.emailVerified} usuários`);
    });
    
    console.log('\n✅ Verificação de manutenção concluída');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  maintenanceCheck();
}

module.exports = { maintenanceCheck }; 