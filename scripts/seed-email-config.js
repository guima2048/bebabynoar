// scripts/seed-email-config.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Configuração do SendGrid (usando dados do .env)
  const config = {
    from: process.env.EMAIL_FROM || 'bebaby@bebaby.app',
    apiKey: process.env.SENDGRID_API_KEY || '',
  };

  // Busca o primeiro registro existente
  const existing = await prisma.emailConfig.findFirst();

  if (existing) {
    await prisma.emailConfig.update({
      where: { id: existing.id },
      data: config,
    });
    console.log('Configuração de e-mail atualizada com sucesso!');
  } else {
    await prisma.emailConfig.create({
      data: config,
    });
    console.log('Configuração de e-mail criada com sucesso!');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 