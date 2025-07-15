const http = require('http');

function testProfileAPI() {
  console.log('🧪 Testando API de perfil...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/user/profile',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📊 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Resposta completa:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ JSON parseado:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('❌ Erro ao fazer parse do JSON:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });

  req.end();
}

testProfileAPI(); 