const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function setupSimple() {
  console.log('🚀 Configurando projeto simplificado...')
  
  try {
    // 1. Criar usuário admin
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bebaby.app' },
      update: {},
      create: {
        email: 'admin@bebaby.app',
        username: 'admin',
        password: adminPassword,
        name: 'Administrador',
        birthdate: new Date('1990-01-01'),
        gender: 'MALE',
        userType: 'SUGAR_DADDY',
        lookingFor: 'SUGAR_BABY',
        state: 'SP',
        city: 'São Paulo',
        verified: true,
        emailVerified: true,
        isAdmin: true,
      },
    })
    console.log('✅ Usuário admin criado:', admin.email)

    // 2. Criar usuários de teste
    const testUsers = [
      {
        email: 'sugar_baby1@example.com',
        username: 'sugar_baby1',
        name: 'Ana Silva',
        birthdate: new Date('1995-01-01'),
        gender: 'FEMALE',
        userType: 'SUGAR_BABY',
        lookingFor: 'SUGAR_DADDY',
        state: 'RJ',
        city: 'Rio de Janeiro',
        about: 'Procurando por relacionamento sugar',
      },
      {
        email: 'sugar_daddy1@example.com',
        username: 'sugar_daddy1',
        name: 'Carlos Santos',
        birthdate: new Date('1980-01-01'),
        gender: 'MALE',
        userType: 'SUGAR_DADDY',
        lookingFor: 'SUGAR_BABY',
        state: 'SP',
        city: 'São Paulo',
        about: 'Empresário bem-sucedido',
      },
    ]

    for (const userData of testUsers) {
      const password = await bcrypt.hash('123456', 12)
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password,
          verified: true,
          emailVerified: true,
        },
      })
      console.log(`✅ Usuário criado: ${userData.email}`)
    }

    console.log('\n🎉 Setup concluído!')
    console.log('\n📋 Dados de acesso:')
    console.log('👤 Admin: admin@bebaby.app / admin123')
    console.log('👧 Sugar Baby: sugar_baby1@example.com / 123456')
    console.log('👨 Sugar Daddy: sugar_daddy1@example.com / 123456')

  } catch (error) {
    console.error('❌ Erro no setup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupSimple() 