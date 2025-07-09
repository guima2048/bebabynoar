import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário admin
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
      premium: true,
      isAdmin: true,
    },
  })

  // Criar usuários de exemplo
  const users = [
    {
      email: 'sugar_baby1@example.com',
      username: 'sugar_baby1',
      name: 'Ana Silva',
      birthdate: new Date('1998-05-15'),
      gender: 'FEMALE' as const,
      userType: 'SUGAR_BABY' as const,
      lookingFor: 'SUGAR_DADDY' as const,
      state: 'SP',
      city: 'São Paulo',
      about: 'Adoro viajar e conhecer pessoas interessantes',
      height: '165cm',
      weight: '55kg',
      education: 'Superior completo',
      profession: 'Estudante',
      hasChildren: false,
      smokes: false,
      drinks: false,
      relationshipType: 'Casual',
      availableForTravel: true,
      receiveTravelers: true,
    },
    {
      email: 'sugar_daddy1@example.com',
      username: 'sugar_daddy1',
      name: 'Carlos Santos',
      birthdate: new Date('1975-03-20'),
      gender: 'MALE' as const,
      userType: 'SUGAR_DADDY' as const,
      lookingFor: 'SUGAR_BABY' as const,
      state: 'RJ',
      city: 'Rio de Janeiro',
      about: 'Executivo bem-sucedido procurando companhia',
      height: '180cm',
      weight: '80kg',
      education: 'Pós-graduação',
      profession: 'Executivo',
      hasChildren: true,
      smokes: false,
      drinks: true,
      relationshipType: 'Longo prazo',
      availableForTravel: true,
      receiveTravelers: true,
    },
    {
      email: 'sugar_mommy1@example.com',
      username: 'sugar_mommy1',
      name: 'Maria Costa',
      birthdate: new Date('1980-08-10'),
      gender: 'FEMALE' as const,
      userType: 'SUGAR_MOMMY' as const,
      lookingFor: 'SUGAR_BABY' as const,
      state: 'MG',
      city: 'Belo Horizonte',
      about: 'Empresária independente',
      height: '170cm',
      weight: '65kg',
      education: 'Superior completo',
      profession: 'Empresária',
      hasChildren: false,
      smokes: false,
      drinks: true,
      relationshipType: 'Casual',
      availableForTravel: true,
      receiveTravelers: false,
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
        verified: true,
        premium: Math.random() > 0.5, // 50% chance de ser premium
      },
    })
  }

  // Criar configurações da landing page
  await prisma.landingSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      bannerTitle: 'Encontre seu Sugar Baby ou Sugar Daddy',
      bannerSubtitle: 'A plataforma mais segura e discreta para relacionamentos sugar',
      bannerDescription: 'Conecte-se com pessoas interessantes e viva experiências únicas',
      primaryButtonText: 'Começar Agora',
      primaryButtonLink: '/register',
      secondaryButtonText: 'Saiba Mais',
      secondaryButtonLink: '/about',
    },
  })

  // Criar depoimentos
  const testimonials = [
    {
      name: 'Ana',
      location: 'São Paulo, SP',
      story: 'Encontrei meu sugar daddy aqui e nossa relação é incrível!',
      rating: 5,
    },
    {
      name: 'Carlos',
      location: 'Rio de Janeiro, RJ',
      story: 'Plataforma muito segura e discreta. Recomendo!',
      rating: 5,
    },
    {
      name: 'Maria',
      location: 'Belo Horizonte, MG',
      story: 'Conheci pessoas maravilhosas aqui. Valeu a pena!',
      rating: 4,
    },
  ]

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial_${testimonial.name}` },
      update: {},
      create: {
        id: `testimonial_${testimonial.name}`,
        ...testimonial,
      },
    })
  }

  // Criar posts do blog
  const blogPosts = [
    {
      title: 'Como ter um relacionamento sugar saudável',
      slug: 'relacionamento-sugar-saudavel',
      content: `
        <h2>Dicas para um relacionamento sugar saudável</h2>
        <p>Um relacionamento sugar pode ser muito gratificante quando baseado em respeito mútuo e comunicação clara.</p>
        <h3>1. Comunicação é fundamental</h3>
        <p>Mantenha sempre uma comunicação aberta e honesta sobre expectativas e limites.</p>
        <h3>2. Respeite os limites</h3>
        <p>Cada pessoa tem seus próprios limites e é importante respeitá-los.</p>
        <h3>3. Seja discreto</h3>
        <p>A discrição é essencial em relacionamentos sugar.</p>
      `,
      excerpt: 'Aprenda como manter um relacionamento sugar saudável e gratificante.',
      published: true,
      publishedAt: new Date(),
      metaTitle: 'Relacionamento Sugar Saudável - Dicas e Conselhos',
      metaDescription: 'Descubra como ter um relacionamento sugar saudável baseado em respeito e comunicação.',
      tags: ['relacionamento', 'dicas', 'saúde'],
    },
    {
      title: 'Segurança em relacionamentos sugar',
      slug: 'seguranca-relacionamentos-sugar',
      content: `
        <h2>Segurança em relacionamentos sugar</h2>
        <p>A segurança deve ser sempre uma prioridade em qualquer tipo de relacionamento.</p>
        <h3>1. Conheça a pessoa</h3>
        <p>Sempre conheça bem a pessoa antes de se encontrar pessoalmente.</p>
        <h3>2. Encontros em locais públicos</h3>
        <p>Primeiros encontros devem sempre ser em locais públicos e movimentados.</p>
        <h3>3. Use proteção</h3>
        <p>Nunca deixe de usar proteção em relações íntimas.</p>
      `,
      excerpt: 'Dicas essenciais de segurança para relacionamentos sugar.',
      published: true,
      publishedAt: new Date(),
      metaTitle: 'Segurança em Relacionamentos Sugar - Guia Completo',
      metaDescription: 'Aprenda como se manter seguro em relacionamentos sugar.',
      tags: ['segurança', 'dicas', 'proteção'],
    },
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        authorId: admin.id,
      },
    })
  }

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