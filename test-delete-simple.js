// Teste simples de exclusão
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('📡 Status:', res.statusCode);
        console.log('📡 Body:', body);
        resolve({
          statusCode: res.statusCode,
          data: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testSimple() {
  try {
    console.log('🧪 Teste simples...');
    
    // Teste sem autenticação primeiro
    console.log('\n🔓 Testando sem autenticação...');
    const noAuthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }, { userId: 'test' });
    
    console.log('✅ Teste sem auth concluído');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testSimple(); 