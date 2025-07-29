const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSMTPConfig() {
  try [object Object]    const config = await prisma.sMTPConfig.findUnique({ 
      where: { id:main' } 
    })
    
    console.log(Configuracao SMTP atual:)
    console.log(JSON.stringify(config, null,2   
    if (config) {
      console.log('\nAnalise:')
      console.log(`- Host: ${config.host}`)
      console.log(`- Porta: ${config.port}`)
      console.log(`- Usuario: ${config.user}`)
      console.log(`- Token: ${config.token ? Configurado' :Nao configurado}`)
      console.log(`- From: ${config.from}`)
      
      const fromEmail = config.from.match(/<(.+?)>/) ? config.from.match(/<(.+?)>/)1 config.from
      const domain = fromEmail.split('@')[1]
      console.log(`- Dominio: ${domain}`)
      
      console.log('\nSugestoes:')
      console.log(1. Verifique se o dominio esta configurado na Locaweb')
      console.log(2. Use um dominio da Locaweb temporariamente')
      console.log('3. Aguarde a propagacao do DNS (pode levar 24-48h)')
    } else {
      console.log('Nenhuma configuracao SMTP encontrada')
    }
    
  } catch (error) {
    console.error('Erro:', error)
  } finally [object Object]    await prisma.$disconnect()
  }
}

checkSMTPConfig() 