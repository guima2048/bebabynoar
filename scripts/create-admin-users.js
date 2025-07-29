const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUsers() {
  try {
    console.log('🔐 Criando usuários admin...')

    // Dados dos usuários admin
    const adminUsers = [
      {
        email: 'admin@bebaby.app',
        username: 'Admin',
        password: process.env.TEST_ADMIN_PASSWORD || 'Maria#01',
        name: 'Administrador Principal',
        isAdmin: true
      },
      {
        email: 'admin2@bebaby.app',
        username: 'Admin2',
        password: process.env.TEST_ADMIN2_PASSWORD || '77330011',
        name: 'Administrador Secundário',
        isAdmin: true
      }
    ]

    for (const adminData of adminUsers) {
      console.log(`📝 Criando usuário: ${adminData.username}`)

      // Verificar se o usuário já existe
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: adminData.email },
            { username: adminData.username }
          ]
        }
      })

      if (existingUser) {
        console.log(`⚠️ Usuário ${adminData.username} já existe. Atualizando...`)
        
        // Atualizar usuário existente
        const hashedPassword = await bcrypt.hash(adminData.password, 12)
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            isAdmin: true,
            emailVerified: true,
            status: 'ACTIVE'
          }
        })
        
        console.log(`✅ Usuário ${adminData.username} atualizado com sucesso`)
      } else {
        // Criar novo usuário
        const hashedPassword = await bcrypt.hash(adminData.password, 12)
        
        await prisma.user.create({
          data: {
            email: adminData.email,
            username: adminData.username,
            password: hashedPassword,
            birthdate: new Date('1990-01-01'), // Data padrão
            gender: 'OTHER', // Gênero padrão
            userType: 'SUGAR_BABY', // Tipo padrão válido
            state: 'SP', // Estado padrão
            city: 'São Paulo', // Cidade padrão
            isAdmin: true,
            emailVerified: true,
            status: 'ACTIVE'
          }
        })
        
        console.log(`✅ Usuário ${adminData.username} criado com sucesso`)
      }
    }

    console.log('🎉 Todos os usuários admin foram criados/atualizados!')
    
    // Listar usuários admin para verificação
    const adminUsersList = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isAdmin: true,
        verified: true,
        createdAt: true
      }
    })

    console.log('\n📋 Usuários admin no sistema:')
    adminUsersList.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.verified ? 'Verificado' : 'Não verificado'}`)
    })

  } catch (error) {
    console.error('❌ Erro ao criar usuários admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
createAdminUsers() 