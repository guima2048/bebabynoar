const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function debugAuth() {
  console.log('🔍 Debugando autenticação...');
  
  try {
    // 1. Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email: 'sugar_daddy1@example.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('✅ Usuário encontrado:', user.email);

    // 2. Verificar se a senha está correta
    const password = '123456';
    const isValid = await bcrypt.compare(password, user.password);
    
    console.log('🔐 Senha válida:', isValid);

    if (!isValid) {
      console.log('❌ Senha incorreta');
      return;
    }

    // 3. Verificar dados do usuário
    console.log('📊 Dados do usuário:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Username:', user.username);
    console.log('- Nome:', user.name);
    console.log('- Tipo:', user.userType);
    console.log('- Gênero:', user.gender);
    console.log('- Verificado:', user.verified);
    console.log('- Premium:', user.premium);
    console.log('- Status:', user.status);

    // 4. Verificar se há problemas com campos obrigatórios
    const requiredFields = ['username', 'userType', 'gender', 'birthdate'];
    const missingFields = requiredFields.filter(field => !user[field]);
    
    if (missingFields.length > 0) {
      console.log('⚠️ Campos obrigatórios faltando:', missingFields);
    } else {
      console.log('✅ Todos os campos obrigatórios estão preenchidos');
    }

    // 5. Simular o que o NextAuth faria
    console.log('\n🔧 Simulando dados que o NextAuth retornaria:');
    const nextAuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || user.username,
      image: user.photoURL || '',
      userType: user.userType,
      premium: user.premium,
      verified: user.verified,
      isAdmin: user.isAdmin
    };
    
    console.log('NextAuth User:', nextAuthUser);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth(); 