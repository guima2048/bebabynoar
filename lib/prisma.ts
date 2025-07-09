import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Configurações de pool de conexões
  // Estas configurações ajudam a gerenciar conexões de forma eficiente
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Função para fechar conexões adequadamente
export async function disconnectPrisma() {
  if (globalForPrisma.prisma) {
    await globalForPrisma.prisma.$disconnect()
    globalForPrisma.prisma = undefined
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectPrisma()
})

export default prisma 