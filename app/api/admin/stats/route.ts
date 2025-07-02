import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore()
    
    // Buscar estatísticas gerais
    const usersSnap = await db.collection('users').get()
    
    const premiumSnap = await db.collection('users')
      .where('premium', '==', true)
      .get()
    
    const reportsSnap = await db.collection('reports')
      .where('status', '==', 'pending')
      .get()
    
    const stats = {
      totalUsers: usersSnap.size,
      premiumUsers: premiumSnap.size,
      pendingReports: reportsSnap.size,
      conversionRate: usersSnap.size > 0 ? (premiumSnap.size / usersSnap.size * 100).toFixed(2) : '0'
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 