// Teste direto de exclusão
const http = require('http');

// Teste simples de exclusão sem login primeiro
async function testDeleteDirect() {
  console.log('🧪 Testando exclusão direta...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/manage-user',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  }, (res) => {
    console.log('📡 Status:', res.statusCode);
    console.log('📡 Headers:', res.headers);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('📡 Body:', body);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error);
  });

  req.write(JSON.stringify({
    userId: 'test-user-id'
  }));
  req.end();
}

testDeleteDirect(); 