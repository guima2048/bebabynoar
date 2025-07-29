// Teste de exclusão com timeout
const http = require('http');

function makeRequestWithTimeout(options, data = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('📡 Status:', res.statusCode);
        console.log('📡 Body:', body);
        
        try {
          const jsonData = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
      reject(error);
    });

    // Timeout
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testDeleteWithTimeout() {
  try {
    console.log('🧪 Testando exclusão com timeout...');
    
    // Teste sem autenticação primeiro
    console.log('🔓 Testando sem autenticação...');
    const response = await makeRequestWithTimeout({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      userId: 'test-user-id'
    }, 5000);
    
    console.log('✅ Resposta recebida:', response);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testDeleteWithTimeout(); 