import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Verificar conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - startTime
    
    // Verificar uso de memória
    const memoryUsage = process.memoryUsage()
    
    // Verificar uptime
    const uptime = process.uptime()
    
    // Verificar variáveis de ambiente críticas
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    }
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: 'connected',
        latency: dbLatency,
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
      },
      environment: envCheck,
      version: process.env.npm_package_version || '1.0.0',
    }
    
    return NextResponse.json(healthStatus, { status: 200 })
    
  } catch (error) {
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: Math.floor(process.uptime()),
    }
    
    return NextResponse.json(errorStatus, { status: 503 })
  }
} 