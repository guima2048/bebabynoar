const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setUserPassword() {
  console.log('🔐 Definindo senha para o usuário sugar_daddy1@example.com...');
  
  try {
    const password = '123456'; // Senha simples para teste
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Atualizar a senha do usuário
    const updatedUser = await prisma.user.update({
      where: { email: 'sugar_daddy1@example.com' },
      data: { password: hashedPassword }
    });

    console.log('✅ Senha definida com sucesso!');
    console.log('📊 Dados de login:');
    console.log('- Email: sugar_daddy1@example.com');
    console.log('- Senha: 123456');
    console.log('- Username: sugar_daddy1');
    console.log('- Nome: Carlos Santos');
    
    console.log('\n🎉 Agora você pode fazer login e testar a página /profile/');
    console.log('O usuário tem todos os campos preenchidos e deve aparecer corretamente na página de perfil.');

  } catch (error) {
    console.error('❌ Erro ao definir senha:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserPassword(); 