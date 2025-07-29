const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testEmail() {
  try {
    const smtpConfig = await prisma.sMTPConfig.findUnique({
      where: { id: 'main' }
    })
    
    if (!smtpConfig) {
      console.log('Configuracao SMTP nao encontrada')
      return
    }
    
    console.log('Testando envio de email...')
    console.log('Token:', smtpConfig.token ? 'Configurado' : 'Nao configurado')
    console.log('From:', smtpConfig.from)
    
    // Estrutura correta conforme documentacao Locaweb
    const emailData = {
      to: [{ email: 'teste@exemplo.com' }],
      subject: 'Teste API Locaweb',
      body: '<h1>Teste</h1><p>Este é um teste da API Locaweb</p>',
      from: {
        name: 'BeBaby',
        email: smtpConfig.from.replace(/.*<(.+?)>.*/, '$1') || smtpConfig.from
      }
    }
    
    console.log('Payload:', JSON.stringify(emailData, null,2))
    
    const response = await fetch('https://api.smtplw.com.br/v1/messages', {
      method: 'POST',
      headers: {
        'x-auth-token': smtpConfig.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })
    
    console.log('Status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.log('Erro:', errorData)
    } else {
      console.log('Sucesso!')
    }
    
  } catch (error) {
    console.error('Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEmail() 