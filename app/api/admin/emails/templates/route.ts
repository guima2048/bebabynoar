import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const configPath = path.join(process.cwd(), 'config', 'email.json')

export async function GET() {
  try {
    if (!fs.existsSync(configPath)) {
      return NextResponse.json([])
    }
    
    const configFile = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(configFile)
    
    // Converter para formato esperado pela página
    const templates = Object.entries(config.templates || {}).map(([slug, template]: [string, any]) => ({
      id: slug,
      slug,
      name: template.name,
      templateId: template.templateId || '',
      enabled: template.enabled !== false,
      testEmail: template.testEmail || '',
      testData: JSON.stringify(template.testData || {})
    }))
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, name, templateId, enabled, testEmail, testData } = body

    // Validação
    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug e nome são obrigatórios' }, { status: 400 })
    }

    // Carregar configuração atual
    let config = { config: {}, templates: {} }
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, 'utf-8')
      config = JSON.parse(configFile)
    }

    // Atualizar template
    (config.templates as any)[slug] = {
      name,
      templateId: templateId || '',
      enabled: enabled !== false,
      testEmail: testEmail || '',
      testData: testData ? JSON.parse(testData) : {}
    }

    // Salvar no arquivo
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    // Retornar template atualizado
    const updatedTemplate = {
      id: slug,
      slug,
      name,
      templateId: templateId || '',
      enabled: enabled !== false,
      testEmail: testEmail || '',
      testData: testData || '{}'
    }

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Erro ao salvar template:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 