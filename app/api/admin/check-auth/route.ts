import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (adminSession && adminSession.value === 'authenticated') {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
} 