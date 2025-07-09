import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    console.log('🔐 Check Auth: Verificando autenticação...')
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin_session')
    
    console.log('🔐 Check Auth: Cookie encontrado:', adminSession ? 'Sim' : 'Não')
    if (adminSession) {
      console.log('🔐 Check Auth: Valor do cookie:', adminSession.value)
      console.log('🔐 Check Auth: Nome do cookie:', adminSession.name)
    }
    
    // Listar todos os cookies para debug
    const allCookies = cookieStore.getAll()
    console.log('🔐 Check Auth: Todos os cookies:', allCookies.map(c => ({ name: c.name, value: c.value })))
    
    if (adminSession && adminSession.value === 'authenticated') {
      console.log('✅ Check Auth: Usuário autenticado')
      return NextResponse.json({ authenticated: true })
    } else {
      console.log('❌ Check Auth: Usuário não autenticado')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

  } catch (error) {
    console.error('❌ Check Auth: Erro ao verificar autenticação:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
} 