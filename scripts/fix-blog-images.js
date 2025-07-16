const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixBlogImages() {
  try {
    console.log('🔍 Verificando posts do blog...')
    
    // Buscar todos os posts
    const posts = await prisma.blogPost.findMany({
      select: {
        id: true,
        title: true,
        featuredImage: true,
        slug: true
      }
    })
    
    console.log(`📝 Encontrados ${posts.length} posts`)
    
    let fixedCount = 0
    
    for (const post of posts) {
      console.log(`\n📄 Post: ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Imagem atual: ${post.featuredImage || 'NENHUMA'}`)
      
      if (post.featuredImage) {
        let newImageUrl = post.featuredImage
        
        // Se a URL não começa com /, adicionar
        if (!post.featuredImage.startsWith('/')) {
          newImageUrl = `/${post.featuredImage}`
          console.log(`   ✅ Corrigindo URL: ${post.featuredImage} → ${newImageUrl}`)
          
          // Atualizar no banco
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { featuredImage: newImageUrl }
          })
          
          fixedCount++
        } else {
          console.log(`   ✅ URL já está correta`)
        }
      } else {
        console.log(`   ⚠️  Post sem imagem de destaque`)
      }
    }
    
    console.log(`\n🎉 Processo concluído!`)
    console.log(`   Posts verificados: ${posts.length}`)
    console.log(`   URLs corrigidas: ${fixedCount}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Executar o script
fixBlogImages() 