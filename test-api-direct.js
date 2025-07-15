const fetch = require('node-fetch');

async function testAPI() {
  console.log('🧪 Testando API diretamente...');
  
  try {
    // Testar a API sem autenticação
    console.log('📡 Testando GET /api/user/profile...');
    const response = await fetch('http://localhost:3001/api/user/profile');
    
    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na resposta:', errorText);
    }
    
    // Testar a API de health
    console.log('\n📡 Testando GET /api/health...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    console.log('📊 Health Status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health data:', healthData);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testAPI(); 