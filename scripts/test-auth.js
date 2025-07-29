const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log('🧪 Testando autenticação...')
    
    // Testar usuários de teste
    const testCredentials = [
      {
        email: 'test@sugar_baby.com',
        password: 'Test123!',
        description: 'Sugar Baby Test'
      },
      {
        email: 'test@sugar_daddy.com',
        password: 'Test123!',
        description: 'Sugar Daddy Test'
      },
      {
        email: 'sugar_baby_test', // Testar login por username
        password: 'Test123!',
        description: 'Sugar Baby Test (username)'
      }
    ]
    
    for (const cred of testCredentials) {
      console.log(`\n🔍 Testando: ${cred.description}`)
      
      // Buscar usuário
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cred.email.toLowerCase() },
            { username: cred.email.toLowerCase() }
          ],
          status: 'ACTIVE'
        }
      })
      
      if (!user) {
        console.log(`❌ Usuário não encontrado: ${cred.email}`)
        continue
      }
      
      console.log(`✅ Usuário encontrado: ${user.email} (${user.username})`)
      console.log(`   Status: ${user.status}`)
      console.log(`   Email verificado: ${user.emailVerified}`)
      console.log(`   Admin: ${user.isAdmin}`)
      
      // Verificar senha
      if (!user.password) {
        console.log(`❌ Usuário sem senha`)
        continue
      }
      
      const isPasswordValid = await bcrypt.compare(cred.password, user.password)
      if (isPasswordValid) {
        console.log(`✅ Senha válida`)
      } else {
        console.log(`❌ Senha inválida`)
      }
    }
    
    // Verificar estatísticas gerais
    console.log('\n📊 Estatísticas do banco:')
    
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } })
    const verifiedUsers = await prisma.user.count({ where: { emailVerified: true } })
    const adminUsers = await prisma.user.count({ where: { isAdmin: true } })
    
    console.log(`- Total de usuários: ${totalUsers}`)
    console.log(`- Usuários ativos: ${activeUsers}`)
    console.log(`- Emails verificados: ${verifiedUsers}`)
    console.log(`- Administradores: ${adminUsers}`)
    
    // Verificar usuários com problemas
    console.log('\n⚠️ Usuários com problemas:')
    
    const usersWithoutPassword = await prisma.user.findMany({
      where: { password: null },
      select: { id: true, email: true, username: true }
    })
    
    if (usersWithoutPassword.length > 0) {
      console.log('Usuários sem senha:')
      usersWithoutPassword.forEach(user => {
        console.log(`  - ${user.email} (${user.username})`)
      })
    } else {
      console.log('✅ Todos os usuários têm senha')
    }
    
    const inactiveVerified = await prisma.user.findMany({
      where: {
        status: 'INACTIVE',
        emailVerified: true
      },
      select: { id: true, email: true, username: true }
    })
    
    if (inactiveVerified.length > 0) {
      console.log('Usuários inativos com email verificado:')
      inactiveVerified.forEach(user => {
        console.log(`  - ${user.email} (${user.username})`)
      })
    } else {
      console.log('✅ Nenhum usuário inativo com email verificado')
    }
    
    console.log('\n✅ Teste de autenticação concluído!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testAuth()
}

module.exports = { testAuth } 