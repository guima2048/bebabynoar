import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação admin
    const adminSession = req.cookies.get('admin_session')
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 401 }
      )
    }

    // Primeiro, criar ou encontrar usuário admin
    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@bebaby.app' },
          { username: 'admin' }
        ]
      }
    })

    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@bebaby.app',
          username: 'admin',
          name: 'Administrador',
          birthdate: new Date('1990-01-01'),
          gender: 'MALE',
          userType: 'SUGAR_DADDY',
          state: 'SP',
          city: 'São Paulo',
          isAdmin: true,
          verified: true,
          emailVerified: true
        }
      })
      console.log('✅ Usuário admin criado:', adminUser.id)
    }

    // Posts de exemplo
    const samplePosts = [
      {
        title: 'Como Encontrar um Sugar Daddy Ideal',
        content: `Encontrar um relacionamento sugar saudável e duradouro pode ser desafiador, mas com as estratégias certas, você pode aumentar significativamente suas chances de sucesso.

## 1. Defina Seus Objetivos

Antes de começar sua busca, é essencial ter clareza sobre o que você está procurando:
- Que tipo de relacionamento você deseja?
- Quais são suas expectativas financeiras?
- Que tipo de experiências você quer viver?

## 2. Escolha a Plataforma Certa

Nem todas as plataformas são iguais. O Bebaby App oferece:
- Verificação rigorosa de usuários
- Sistema de segurança avançado
- Comunidade exclusiva e selecionada

## 3. Crie um Perfil Atraente

Seu perfil é sua primeira impressão:
- Use fotos de alta qualidade
- Escreva uma bio interessante e autêntica
- Destaque suas qualidades únicas

## 4. Seja Seletiva

Não aceite qualquer proposta. Procure por:
- Respeito mútuo
- Compatibilidade de interesses
- Expectativas alinhadas

## 5. Mantenha a Segurança

Sempre priorize sua segurança:
- Conheça a pessoa antes de se encontrar
- Escolha locais públicos para primeiros encontros
- Confie em seus instintos

Lembre-se: um relacionamento sugar de sucesso é baseado em respeito, transparência e benefícios mútuos.`,
        excerpt: 'Dicas práticas para encontrar um relacionamento sugar saudável e duradouro.',
        featuredImage: '/landing/baby-1.png',
        status: 'PUBLISHED'
      },
      {
        title: 'Finanças Pessoais para Sugar Babies',
        content: `Gerenciar seu dinheiro de forma inteligente é fundamental para construir independência financeira e garantir um futuro próspero.

## Planejamento Financeiro

### 1. Estabeleça Metas
- Defina objetivos de curto, médio e longo prazo
- Crie um plano de ação específico
- Monitore seu progresso regularmente

### 2. Orçamento Inteligente
- Separe 50% para necessidades básicas
- Reserve 30% para desejos e experiências
- Invista 20% para o futuro

### 3. Diversificação de Renda
- Não dependa apenas de uma fonte de renda
- Explore oportunidades de investimento
- Desenvolva habilidades monetizáveis

## Investimentos para Iniciantes

### Poupança de Emergência
- Mantenha 6 meses de despesas em reserva
- Use conta separada para emergências
- Não toque neste dinheiro para gastos desnecessários

### Investimentos Básicos
- Tesouro Direto (seguro e acessível)
- Fundos de investimento
- Ações de empresas sólidas

## Proteção Financeira

### Seguros Essenciais
- Seguro de vida
- Seguro de saúde
- Seguro patrimonial

### Documentação
- Mantenha todos os documentos organizados
- Faça backup digital
- Consulte um contador se necessário

Lembre-se: independência financeira é liberdade!`,
        excerpt: 'Como gerenciar seu dinheiro de forma inteligente e construir independência financeira.',
        featuredImage: '/landing/padraomulher.webp',
        status: 'PUBLISHED'
      },
      {
        title: 'Viagens e Experiências Únicas',
        content: `Descubra destinos incríveis e como aproveitar ao máximo suas viagens, criando memórias inesquecíveis.

## Destinos Exclusivos

### Europa
- **Paris, França**: A cidade do amor e da elegância
- **Milão, Itália**: Capital da moda e do design
- **Barcelona, Espanha**: Arquitetura única e cultura vibrante

### Américas
- **Nova York, EUA**: A cidade que nunca dorme
- **Miami, EUA**: Praias paradisíacas e vida noturna
- **Rio de Janeiro, Brasil**: Beleza natural e carnaval

### Ásia
- **Tóquio, Japão**: Tecnologia e tradição
- **Bangkok, Tailândia**: Cultura exótica e gastronomia
- **Dubai, Emirados Árabes**: Luxo e inovação

## Dicas para Viagens Perfeitas

### Planejamento
- Pesquise o destino com antecedência
- Reserve hotéis de qualidade
- Planeje atividades especiais

### Experiências Únicas
- Jantares em restaurantes exclusivos
- Passeios de helicóptero
- Spas de luxo
- Compras em boutiques exclusivas

### Segurança
- Mantenha documentos seguros
- Use cofres do hotel
- Tenha contatos de emergência

## Memórias Inesquecíveis

### Fotografia
- Contrate fotógrafos profissionais
- Capture momentos especiais
- Crie álbuns digitais

### Networking
- Conecte-se com pessoas locais
- Participe de eventos exclusivos
- Expanda sua rede social

Lembre-se: as melhores viagens são aquelas que transformam você!`,
        excerpt: 'Descubra destinos incríveis e como aproveitar ao máximo suas viagens.',
        featuredImage: '/landing/padraohomem.webp',
        status: 'PUBLISHED'
      }
    ]

    // Inserir posts
    const createdPosts = []
    for (const postData of samplePosts) {
      // Criar slug único
      const baseSlug = postData.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      let slug = baseSlug
      let counter = 1

      // Verificar se slug já existe
      while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      const post = await prisma.blogPost.create({
        data: {
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          slug,
          status: postData.status as 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED',
          featuredImage: postData.featuredImage,
          metaTitle: postData.title,
          metaDescription: postData.excerpt,
          publishedAt: postData.status === 'PUBLISHED' ? new Date() : null,
          authorId: adminUser.id // Usar o ID do usuário admin criado
        }
      })

      createdPosts.push(post)
    }

    console.log('✅ Posts de exemplo criados:', createdPosts.length)

    return NextResponse.json({
      success: true,
      message: `${createdPosts.length} posts de exemplo criados com sucesso`,
      posts: createdPosts
    })

  } catch (error) {
    console.error('❌ Erro ao criar posts de exemplo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 