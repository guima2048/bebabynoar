const http = require('http');

function testServer() {
  console.log('🧪 Testando conectividade com o servidor...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📊 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Resposta:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });

  req.end();
}

testServer(); 