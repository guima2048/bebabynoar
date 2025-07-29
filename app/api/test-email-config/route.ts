import { NextRequest, NextResponse } from 'next/server'
import { emailConfig } from '@/lib/email-config'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 TESTANDO CONFIGURAÇÃO DE EMAIL VIA API')
    console.log('========================================')

    // Verificar todas as variáveis de ambiente relacionadas
    console.log('🌍 TODAS AS VARIÁVEIS DE AMBIENTE:')
    console.log('   EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('   SENDGRID_FROM:', process.env.SENDGRID_FROM)
    console.log('   SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Configurada' : '❌ Não configurada')
    console.log('   NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

    // Verificar configuração
    const config = emailConfig.getConfig()
    console.log('📧 Configuração carregada:', {
      from: config.from,
      hasApiKey: !!config.apiKey,
      apiKeyLength: config.apiKey ? config.apiKey.length : 0
    })

    // Verificar templates
    const templates = emailConfig.getAllTemplates()
    console.log('📋 Templates:', Object.keys(templates).map(key => ({
      slug: key,
      enabled: templates[key].enabled,
      hasTemplateId: !!templates[key].templateId,
      templateId: templates[key].templateId
    })))

    // Verificar se está válido
    const isValid = emailConfig.isValid()
    console.log('✅ Configuração válida:', isValid)

    // Informações de debug
    const debugInfo = emailConfig.getDebugInfo()
    console.log('🔧 Debug info:', debugInfo)

    return NextResponse.json({
      success: true,
      envVars: {
        EMAIL_FROM: process.env.EMAIL_FROM,
        SENDGRID_FROM: process.env.SENDGRID_FROM,
        hasSendGridKey: !!process.env.SENDGRID_API_KEY,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL
      },
      config: {
        from: config.from,
        hasApiKey: !!config.apiKey,
        apiKeyLength: config.apiKey ? config.apiKey.length : 0
      },
      templates: Object.keys(templates).map(key => ({
        slug: key,
        enabled: templates[key].enabled,
        hasTemplateId: !!templates[key].templateId,
        templateId: templates[key].templateId
      })),
      isValid,
      debugInfo
    })

  } catch (error) {
    console.error('❌ Erro ao testar configuração:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 