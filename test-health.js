// Teste de saúde do servidor
const http = require('http');

function testHealth() {
  console.log('🏥 Testando saúde do servidor...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log('📡 Status:', res.statusCode);
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('📡 Body:', body);
      console.log('✅ Servidor respondendo');
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error);
  });

  req.end();
}

testHealth(); 