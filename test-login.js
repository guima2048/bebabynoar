const bcrypt = require('bcryptjs')

async function testLogin() {
  try {
    console.log('🔍 Testando login...')
    
    // Dados de teste
    const testEmail = 'sugar_baby1@example.com'
    const testPassword = '123456'
    
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🔑 Senha: ${testPassword}`)
    
    // Simular hash da senha (como seria feito no authorize)
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    console.log(`🔐 Hash da senha: ${hashedPassword}`)
    
    // Verificar se a senha está correta
    const isValid = await bcrypt.compare(testPassword, hashedPassword)
    console.log(`✅ Senha válida: ${isValid}`)
    
    // Simular o que o authorize retornaria
    const mockUser = {
      id: 'cmcxd110n000111esk3547jv4',
      email: testEmail,
      name: 'Ana Silva',
      image: '',
      userType: 'SUGAR_BABY',
      premium: false,
      verified: false,
      isAdmin: false
    }
    
    console.log('\n📋 Dados que seriam retornados pelo authorize:')
    console.log(JSON.stringify(mockUser, null, 2))
    
    console.log('\n🔍 Verificando se o ID está presente:')
    console.log(`ID: ${mockUser.id} (${typeof mockUser.id})`)
    console.log(`Email: ${mockUser.email}`)
    console.log(`Nome: ${mockUser.name}`)
    
  } catch (error) {
    console.error('❌ Erro:', error)
  }
}

testLogin() 