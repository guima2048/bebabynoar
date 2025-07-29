const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEmailVerification() {
  try {
    console.log('🔍 Verificando configuração do banco de dados...');
    
    // 1. Verificar se o campo emailVerified existe
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'emailVerified'
    `;
    
    console.log('📋 Informações da coluna emailVerified:', tableInfo);
    
    // 2. Verificar alguns usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerifiedAt: true,
        verified: true,
        createdAt: true
      },
      take: 5
    });
    
    console.log('👥 Usuários encontrados:', users);
    
    // 3. Verificar se há usuários com emailVerified = false
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: false
      },
      select: {
        id: true,
        email: true,
        emailVerified: true
      }
    });
    
    console.log('❌ Usuários não verificados:', unverifiedUsers);
    
    // 4. Verificar se há usuários com emailVerified = null
    const nullVerifiedUsers = await prisma.user.findMany({
      where: {
        emailVerified: null
      },
      select: {
        id: true,
        email: true,
        emailVerified: true
      }
    });
    
    console.log('⚠️ Usuários com emailVerified = null:', nullVerifiedUsers);
    
    // 5. Verificar se o campo verified está sendo usado incorretamente
    const verifiedUsers = await prisma.user.findMany({
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
    
    console.log('🔄 Usuários com verified=true mas emailVerified=false:', verifiedUsers);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function fixEmailVerification() {
  try {
    console.log('🔧 Corrigindo verificação de email...');
    
    // 1. Atualizar todos os usuários que têm verified=true para emailVerified=true
    const result = await prisma.user.updateMany({
      where: {
        verified: true,
        emailVerified: false
      },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
    
    console.log(`✅ ${result.count} usuários atualizados`);
    
    // 2. Atualizar usuários com emailVerified=null para false
    const nullResult = await prisma.user.updateMany({
      where: {
        emailVerified: null
      },
      data: {
        emailVerified: false
      }
    });
    
    console.log(`✅ ${nullResult.count} usuários com null corrigidos`);
    
    // 3. Verificar resultado
    const finalCheck = await prisma.user.findMany({
      where: {
        OR: [
          { emailVerified: null },
          { verified: true, emailVerified: false }
        ]
      },
      select: {
        id: true,
        email: true,
        verified: true,
        emailVerified: true
      }
    });
    
    console.log('🔍 Verificação final:', finalCheck);
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar debug
debugEmailVerification().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('Deseja corrigir os problemas encontrados? (y/n)');
  process.stdin.once('data', (data) => {
    if (data.toString().trim().toLowerCase() === 'y') {
      fixEmailVerification();
    } else {
      console.log('Correção cancelada');
      process.exit(0);
    }
  });
}); 