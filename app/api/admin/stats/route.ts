import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    
    // Buscar estatísticas gerais
    const usersQuery = query(collection(db, 'users'))
    const usersSnap = await getDocs(usersQuery)
    
    const premiumUsersQuery = query(
      collection(db, 'users'),
      where('premium', '==', true)
    )
    const premiumSnap = await getDocs(premiumUsersQuery)
    
    const reportsQuery = query(
      collection(db, 'reports'),
      where('status', '==', 'pending')
    )
    const reportsSnap = await getDocs(reportsQuery)
    
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