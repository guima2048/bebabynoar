import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not found', status: 404 })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', ...params.path)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found', status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const contentType = getContentType(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Erro ao servir arquivo:', error)
    return NextResponse.json({ error: 'Internal server error', status: 500 })
  }
}

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
} 