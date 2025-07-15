const fetch = require('node-fetch').default

async function testApiLogin() {
  try {
    console.log('🔍 Testando login via API...')
    
    // Dados de teste
    const testEmail = 'sugar_baby1@example.com'
    const testPassword = '123456'
    
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🔑 Senha: ${testPassword}`)
    
    // Fazer login via API
    const loginResponse = await fetch('http://localhost:3000/api/auth/[...nextauth]/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        callbackUrl: 'http://localhost:3000',
        json: true
      })
    })
    
    console.log('📊 Status da resposta de login:', loginResponse.status)
    console.log('📊 Headers da resposta:', Object.fromEntries(loginResponse.headers.entries()))
    
    const loginData = await loginResponse.text()
    console.log('📋 Dados da resposta de login:', loginData)
    
    // Extrair cookies da resposta
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('🍪 Cookies recebidos:', cookies)
    
    if (cookies) {
      // Testar acesso ao perfil com os cookies
      console.log('\n🔍 Testando acesso ao perfil...')
      
      const profileResponse = await fetch('http://localhost:3000/api/user/profile', {
        headers: {
          'Cookie': cookies
        }
      })
      
      console.log('📊 Status da resposta do perfil:', profileResponse.status)
      
      const profileData = await profileResponse.text()
      console.log('📋 Dados da resposta do perfil:', profileData)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testApiLogin() 