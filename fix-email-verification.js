const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEmailVerification() {
  try {
    console.log('🔧 Corrigindo verificação de email...');
    
    // 1. Primeiro, vamos verificar o estado atual
    const usersWithVerifiedTrue = await prisma.user.findMany({
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
    
    console.log(`🔍 Encontrados ${usersWithVerifiedTrue.length} usuários com verified=true mas emailVerified=false`);
    
    // 2. Atualizar usuários que têm verified=true para emailVerified=true
    for (const user of usersWithVerifiedTrue) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date()
        }
      });
      console.log(`✅ Usuário ${user.email} atualizado`);
    }
    
    // 3. Verificar resultado final
    const finalCheck = await prisma.user.findMany({
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
    
    console.log('🔍 Verificação final - Problemas restantes:', finalCheck);
    
    // 4. Mostrar estatísticas
    const verifiedCount = await prisma.user.count({
      where: { emailVerified: true }
    });
    
    const unverifiedCount = await prisma.user.count({
      where: { emailVerified: false }
    });
    
    console.log('📊 Estatísticas finais:');
    console.log(`   - Usuários com email verificado: ${verifiedCount}`);
    console.log(`   - Usuários sem email verificado: ${unverifiedCount}`);
    
    if (finalCheck.length === 0) {
      console.log('🎉 Problema resolvido! Todos os usuários com verified=true agora têm emailVerified=true');
    } else {
      console.log('⚠️ Ainda há problemas para resolver');
    }
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar correção
fixEmailVerification(); 