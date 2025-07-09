import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// POST - Upload de imagem
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Não autorizado - Acesso administrativo necessário' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const postId = formData.get('postId') as string
    const alt = formData.get('alt') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB.' },
        { status: 400 }
      )
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `blog-${timestamp}-${randomString}.${extension}`

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'blog')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Salvar arquivo
    const filePath = join(uploadDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL pública do arquivo
    const fileUrl = `/uploads/blog/${filename}`

    // Buscar usuário admin para associar ao upload
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Usuário administrador não encontrado' },
        { status: 500 }
      )
    }

    // Salvar informações no banco
    const imageRecord = await prisma.blogImage.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: fileUrl,
        alt: alt || '',
        postId: postId || null,
        uploadedBy: adminUser.id,
      }
    })

    console.log('✅ Imagem enviada:', imageRecord.id)

    return NextResponse.json({
      success: true,
      image: {
        id: imageRecord.id,
        filename: imageRecord.filename,
        url: imageRecord.url,
        alt: imageRecord.alt,
        size: imageRecord.size,
        mimeType: imageRecord.mimeType,
      }
    })

  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar imagens do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Não autorizado - Acesso administrativo necessário' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const offset = (page - 1) * limit

    // Buscar usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Usuário administrador não encontrado' },
        { status: 500 }
      )
    }

    // Construir filtros
    const where: any = {
      uploadedBy: adminUser.id
    }

    if (postId) {
      where.postId = postId
    }

    // Buscar imagens
    const [images, total] = await Promise.all([
      prisma.blogImage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.blogImage.count({ where })
    ])

    // Formatar resposta
    const formattedImages = images.map(image => ({
      id: image.id,
      filename: image.filename,
      originalName: image.originalName,
      url: image.url,
      alt: image.alt,
      size: image.size,
      mimeType: image.mimeType,
      createdAt: image.createdAt,
      postId: image.postId,
    }))

    return NextResponse.json({
      success: true,
      images: formattedImages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      }
    })

  } catch (error) {
    console.error('❌ Erro ao buscar imagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar imagem
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Não autorizado - Acesso administrativo necessário' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json(
        { error: 'ID da imagem é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a imagem existe e se o usuário é o proprietário
    const image = await prisma.blogImage.findUnique({
      where: { id: imageId }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada' },
        { status: 404 }
      )
    }

    // Buscar usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Usuário administrador não encontrado' },
        { status: 500 }
      )
    }

    // Verificar se a imagem pertence ao admin
    if (image.uploadedBy !== adminUser.id) {
      return NextResponse.json(
        { error: 'Não autorizado - Apenas o administrador pode deletar esta imagem' },
        { status: 403 }
      )
    }

    // Deletar arquivo físico
    try {
      const { unlink } = await import('fs/promises')
      const filePath = join(process.cwd(), 'public', image.url)
      await unlink(filePath)
    } catch (fileError) {
      console.error('Erro ao deletar arquivo físico:', fileError)
      // Continuar mesmo se não conseguir deletar o arquivo físico
    }

    // Deletar registro do banco
    await prisma.blogImage.delete({
      where: { id: imageId }
    })

    console.log('✅ Imagem deletada:', imageId)

    return NextResponse.json({
      success: true,
      message: 'Imagem deletada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao deletar imagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 