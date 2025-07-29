// Verificar configuração do template do SendGrid
const { PrismaClient } = require('@prisma/client');

async function checkSendGridTemplate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 VERIFICANDO TEMPLATE DO SENDGRID');
    console.log('===================================');
    
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: 'email-confirmation' }
    });
    
    console.log('📋 Template ID:', template?.templateId);
    
    // Verificar se o template existe no SendGrid
    const config = await prisma.emailConfig.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    
    if (!config) {
      console.log('❌ Configuração não encontrada');
      return;
    }
    
    console.log('🔍 Verificando template no SendGrid...');
    
    const response = await fetch(`https://api.sendgrid.com/v3/templates/${template.templateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const templateData = await response.json();
      console.log('✅ Template encontrado no SendGrid');
      console.log('📋 Nome do template:', templateData.name);
      console.log('📋 Versão ativa:', templateData.active);
      
      // Verificar se há versões do template
      const versionsResponse = await fetch(`https://api.sendgrid.com/v3/templates/${template.templateId}/versions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (versionsResponse.ok) {
        const versions = await versionsResponse.json();
        console.log('📋 Versões disponíveis:', versions.length);
        
        if (versions.length > 0) {
          const activeVersion = versions.find(v => v.active);
          if (activeVersion) {
            console.log('📋 Versão ativa:', activeVersion.name);
            console.log('📋 ID da versão:', activeVersion.id);
            
            // Verificar o conteúdo do template
            const versionResponse = await fetch(`https://api.sendgrid.com/v3/templates/${template.templateId}/versions/${activeVersion.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (versionResponse.ok) {
              const versionData = await versionResponse.json();
              console.log('📋 Conteúdo do template:');
              console.log('- HTML:', versionData.html_content ? 'Presente' : 'Ausente');
              console.log('- Text:', versionData.plain_content ? 'Presente' : 'Ausente');
              console.log('- Subject:', versionData.subject);
              
              // Procurar por variáveis no conteúdo
              const htmlContent = versionData.html_content || '';
              const textContent = versionData.plain_content || '';
              
              console.log('🔍 Variáveis encontradas no template:');
              const variables = [...new Set([
                ...htmlContent.match(/\{\{([^}]+)\}\}/g) || [],
                ...textContent.match(/\{\{([^}]+)\}\}/g) || []
              ])];
              
              variables.forEach(variable => {
                console.log(`- ${variable}`);
              });
              
              console.log('⚠️ VERIFICAÇÃO:');
              console.log('- O template deve usar {{nome}} e {{link_confirmacao}}');
              console.log('- Se usar outras variáveis, o email não mostrará os dados corretos');
            }
          }
        }
      }
    } else {
      console.log('❌ Template não encontrado no SendGrid');
      console.log('Status:', response.status);
      const errorText = await response.text();
      console.log('Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSendGridTemplate(); 