const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSpecificUsers() {
  try {
    console.log('🔧 Corrigindo usuários específicos...');
    
    // Lista de emails que precisam ser corrigidos
    const emailsToFix = [
      'teste3@example.com',
      'teste2@example.com', 
      'test@example.com',
      'antoniog2048@gmail.com'
    ];
    
    console.log(`📧 Corrigindo ${emailsToFix.length} usuários...`);
    
    for (const email of emailsToFix) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, emailVerified: true }
        });
        
        if (user && !user.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: true,
              emailVerifiedAt: new Date()
            }
          });
          console.log(`✅ ${email} corrigido`);
        } else if (user && user.emailVerified) {
          console.log(`✅ ${email} já estava correto`);
        } else {
          console.log(`❌ ${email} não encontrado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao corrigir ${email}:`, error.message);
      }
    }
    
    // Verificar resultado
    console.log('\n🔍 Verificação final...');
    const finalCheck = await prisma.user.findMany({
      where: {
        emailVerified: false
      },
      select: {
        email: true,
        emailVerified: true
      }
    });
    
    if (finalCheck.length === 0) {
      console.log('🎉 Todos os usuários foram corrigidos!');
    } else {
      console.log('⚠️ Ainda há usuários sem email verificado:');
      finalCheck.forEach(user => {
        console.log(`   - ${user.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpecificUsers(); 