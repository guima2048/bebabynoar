const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUsers() {
  try {
    console.log('🧪 Criando usuários de teste...')
    
    const testUsers = [
      {
        email: 'test@sugar_baby.com',
        username: 'sugar_baby_test',
        password: 'Test123!',
        birthdate: new Date('1995-01-01'),
        gender: 'FEMALE',
        userType: 'SUGAR_BABY',
        lookingFor: 'SUGAR_DADDY',
        state: 'SP',
        city: 'São Paulo',
        about: 'Usuário de teste - Sugar Baby',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE'
      },
      {
        email: 'test@sugar_daddy.com',
        username: 'sugar_daddy_test',
        password: 'Test123!',
        birthdate: new Date('1980-01-01'),
        gender: 'MALE',
        userType: 'SUGAR_DADDY',
        lookingFor: 'SUGAR_BABY',
        state: 'SP',
        city: 'São Paulo',
        about: 'Usuário de teste - Sugar Daddy',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE'
      },
      {
        email: 'admin@bebaby.app',
        username: 'admin',
        password: 'Admin123!',
        birthdate: new Date('1990-01-01'),
        gender: 'MALE',
        userType: 'SUGAR_DADDY',
        lookingFor: 'SUGAR_BABY',
        state: 'SP',
        city: 'São Paulo',
        about: 'Administrador do sistema',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        status: 'ACTIVE',
        isAdmin: true
      }
    ]
    
    for (const userData of testUsers) {
      // Verificar se usuário já existe
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      })
      
      if (existingUser) {
        console.log(`⚠️ Usuário já existe: ${userData.email}`)
        continue
      }
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      // Criar usuário
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      })
      
      console.log(`✅ Usuário criado: ${user.email} (${user.username})`)
      console.log(`   Senha: ${userData.password}`)
    }
    
    console.log('\n📋 Credenciais de teste:')
    console.log('Sugar Baby: test@sugar_baby.com / Test123!')
    console.log('Sugar Daddy: test@sugar_daddy.com / Test123!')
    console.log('Admin: admin@bebaby.app / Admin123!')
    
    console.log('\n✅ Usuários de teste criados com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUsers()
}

module.exports = { createTestUsers } 