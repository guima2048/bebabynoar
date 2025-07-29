const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixEmailVerification() {
  try {
    console.log('🔧 Iniciando correção de verificação de email...')
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        status: true
      }
    })
    
    console.log(`📊 Total de usuários encontrados: ${users.length}`)
    
    let fixedCount = 0
    let verifiedCount = 0
    
    for (const user of users) {
      // Se o usuário está ativo, considerar email como verificado
      if (user.status === 'ACTIVE' && !user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        })
        console.log(`✅ Corrigido: ${user.email} (${user.username})`)
        fixedCount++
      }
      
      if (user.emailVerified) {
        verifiedCount++
      }
    }
    
    console.log('\n📈 Estatísticas:')
    console.log(`- Usuários com email verificado: ${verifiedCount}`)
    console.log(`- Usuários corrigidos: ${fixedCount}`)
    console.log(`- Total de usuários: ${users.length}`)
    
    // Verificar se há usuários inativos com email verificado
    const inactiveVerified = await prisma.user.findMany({
      where: {
        status: 'INACTIVE',
        emailVerified: true
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    })
    
    if (inactiveVerified.length > 0) {
      console.log('\n⚠️ Usuários inativos com email verificado:')
      inactiveVerified.forEach(user => {
        console.log(`- ${user.email} (${user.username})`)
      })
    }
    
    console.log('\n✅ Correção concluída com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixEmailVerification()
}

module.exports = { fixEmailVerification } 