import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔐 Admin Logout: Iniciando logout...')
    
    // Remove cookie de sessão
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })
    
    response.cookies.delete('admin_session')
    console.log('✅ Admin Logout: Cookie removido com sucesso')

    return response

  } catch (error) {
    console.error('❌ Admin Logout: Erro no logout administrativo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 