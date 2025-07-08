import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'references')
    
    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const savedFiles = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${extension}`
      
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      
      savedFiles.push({
        id: `${timestamp}-${randomString}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.includes('pdf') || file.type.includes('doc') ? 'document' : 'other',
        size: file.size,
        url: `/uploads/references/${fileName}`,
        uploadedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      files: savedFiles,
      message: `${savedFiles.length} arquivo(s) salvo(s) com sucesso`
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'references')
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ files: [] })
    }

    // Em uma implementação real, você salvaria os metadados no banco de dados
    // Por enquanto, retornamos uma lista vazia
    return NextResponse.json({ files: [] })
  } catch (error) {
    console.error('Erro ao listar arquivos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 