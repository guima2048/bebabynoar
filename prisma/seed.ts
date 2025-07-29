import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
  const adminPassword = await bcrypt.hash(process.env.TEST_ADMIN_PASSWORD || 'admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bebaby.app' },
    update: {},
    create: {
      email: 'admin@bebaby.app',
      username: 'admin',
      password: adminPassword,
      birthdate: new Date('1990-01-01'),
      gender: 'MALE',
      userType: 'SUGAR_DADDY',
      lookingFor: 'SUGAR_BABY',
      state: 'SP',
      city: 'São Paulo',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      premium: true,
      isAdmin: true,
    },
  })

  // Criar usuários de exemplo
  const users = [
    {
      email: 'sugar_baby1@example.com',
      username: 'sugar_baby1',
      birthdate: new Date('1998-05-15'),
      gender: 'FEMALE' as const,
      userType: 'SUGAR_BABY' as const,
      lookingFor: 'SUGAR_DADDY' as const,
      state: 'SP',
      city: 'São Paulo',
      about: 'Adoro viajar e conhecer pessoas interessantes',
      education: 'Superior completo',
      profession: 'Estudante',
    },
    {
      email: 'sugar_daddy1@example.com',
      username: 'sugar_daddy1',
      birthdate: new Date('1975-03-20'),
      gender: 'MALE' as const,
      userType: 'SUGAR_DADDY' as const,
      lookingFor: 'SUGAR_BABY' as const,
      state: 'RJ',
      city: 'Rio de Janeiro',
      about: 'Executivo bem-sucedido procurando companhia',
      education: 'Pós-graduação',
      profession: 'Executivo',
    },
    {
      email: 'sugar_mommy1@example.com',
      username: 'sugar_mommy1',
      birthdate: new Date('1980-08-10'),
      gender: 'FEMALE' as const,
      userType: 'SUGAR_MOMMY' as const,
      lookingFor: 'SUGAR_BABY' as const,
      state: 'MG',
      city: 'Belo Horizonte',
      about: 'Empresária independente',
      education: 'Superior completo',
      profession: 'Empresária',
    },
  ]

  for (const userData of users) {
    const password = await bcrypt.hash('123456', 12)
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        password,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        premium: Math.random() > 0.5, // 50% chance de ser premium
      },
    })
  }

  // Seed básico concluído - apenas usuários criados

  console.log('✅ Seed concluído com sucesso!')
  console.log(`👤 Admin criado: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 