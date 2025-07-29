const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🗄️ Resetando banco de dados...')
  
  try {
    // Deletar todas as tabelas na ordem correta
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`
    await prisma.$executeRaw`CREATE SCHEMA public`
    await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO postgres`
    await prisma.$executeRaw`GRANT ALL ON SCHEMA public TO public`
    
    console.log('✅ Banco de dados resetado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetDatabase() 