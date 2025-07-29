const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('🔍 Verificando todos os usuários...');
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        emailVerifiedAt: true,
        verified: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 Total de usuários: ${users.length}`);
    
    // Categorizar usuários
    const categories = {
      verified: [],
      unverified: [],
      noPassword: [],
      noEmailVerified: []
    };
    
    users.forEach(user => {
      if (!user.password) {
        categories.noPassword.push(user);
      } else if (!user.emailVerified) {
        categories.noEmailVerified.push(user);
      } else if (user.verified) {
        categories.verified.push(user);
      } else {
        categories.unverified.push(user);
      }
    });
    
    console.log('\n📋 Categorização dos usuários:');
    console.log(`✅ Verificados e com email confirmado: ${categories.verified.length}`);
    console.log(`❌ Não verificados: ${categories.unverified.length}`);
    console.log(`🔒 Sem senha: ${categories.noPassword.length}`);
    console.log(`📧 Sem email verificado: ${categories.noEmailVerified.length}`);
    
    // Mostrar usuários problemáticos
    if (categories.noEmailVerified.length > 0) {
      console.log('\n⚠️ Usuários sem email verificado (causam redirecionamento):');
      categories.noEmailVerified.forEach(user => {
        console.log(`   - ${user.email} (verified: ${user.verified})`);
      });
    }
    
    if (categories.noPassword.length > 0) {
      console.log('\n⚠️ Usuários sem senha:');
      categories.noPassword.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    }
    
    // Verificar se há inconsistências
    const inconsistentUsers = users.filter(user => 
      user.verified === true && user.emailVerified === false
    );
    
    if (inconsistentUsers.length > 0) {
      console.log('\n🔄 Usuários com inconsistência (verified=true mas emailVerified=false):');
      inconsistentUsers.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    }
    
    // Sugerir correções
    console.log('\n🔧 Sugestões de correção:');
    
    if (categories.noEmailVerified.length > 0) {
      console.log('1. Corrigir usuários sem email verificado:');
      console.log('   node fix-specific-users.js');
    }
    
    if (inconsistentUsers.length > 0) {
      console.log('2. Corrigir inconsistências:');
      console.log('   node fix-inconsistencies.js');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers(); 