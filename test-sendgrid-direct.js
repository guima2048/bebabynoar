// Teste direto do SendGrid com dados reais
const { PrismaClient } = require('@prisma/client');

async function testSendGridDirect() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📧 TESTE DIRETO DO SENDGRID');
    console.log('===========================');
    
    // Buscar configuração
    const config = await prisma.emailConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' }
    });
    
    if (!config || !template) {
      console.log('❌ Configuração ou template não encontrado');
      return;
    }
    
    // Dados reais de teste
    const testUser = {
      email: 'teste.real@example.com',
      username: 'usuario_teste_real',
      name: null
    };
    
    const verificationUrl = `http://localhost:3000/verify-email?token=teste123&email=${encodeURIComponent(testUser.email)}`;
    
    const dynamicTemplateData = {
      nome: testUser.name || testUser.username,
      link_confirmacao: verificationUrl
    };
    
    console.log('📤 Enviando email com dados reais:');
    console.log('- Para:', testUser.email);
    console.log('- Nome:', dynamicTemplateData.nome);
    console.log('- Link:', dynamicTemplateData.link_confirmacao);
    console.log('- Template ID:', template.templateId);
    
    const sendGridData = {
      personalizations: [
        {
          to: [{ email: testUser.email }],
          dynamic_template_data: dynamicTemplateData
        }
      ],
      from: { email: config.from },
      template_id: template.templateId
    };
    
    console.log('📋 Payload completo:', JSON.stringify(sendGridData, null, 2));
    
    // Enviar para SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendGridData)
    });
    
    console.log('📧 Resposta do SendGrid:');
    console.log('- Status:', response.status);
    console.log('- Status Text:', response.statusText);
    console.log('- OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro do SendGrid:', errorText);
    } else {
      console.log('✅ Email enviado com sucesso!');
      console.log('📧 Verifique se o email chegou com os dados corretos:');
      console.log('- Nome deve ser:', dynamicTemplateData.nome);
      console.log('- Link deve ser:', dynamicTemplateData.link_confirmacao);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSendGridDirect(); 