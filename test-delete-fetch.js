// Teste usando fetch
const fetch = require('node-fetch');

async function testWithFetch() {
  try {
    console.log('🧪 Teste com fetch...');
    
    // Login
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: process.env.TEST_ADMIN_USERNAME || 'admin', password: process.env.TEST_ADMIN_PASSWORD || 'admin123' })
    });
    
    console.log('📡 Login status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falhou');
      return;
    }
    
    // Teste DELETE
    console.log('\n🗑️ Testando DELETE...');
    const deleteResponse = await fetch('http://localhost:3000/api/admin/manage-user', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'admin_session=authenticated'
      },
      body: JSON.stringify({ userId: 'invalid-id' })
    });
    
    console.log('📡 DELETE status:', deleteResponse.status);
    const deleteBody = await deleteResponse.text();
    console.log('📡 DELETE body:', deleteBody);
    
    console.log('✅ Teste concluído');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testWithFetch(); 