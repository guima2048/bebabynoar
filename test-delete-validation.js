// Teste de validação do DELETE
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
        console.log('📡 Headers:', res.headers);
        console.log('📡 Body:', body);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
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

async function testValidation() {
  try {
    console.log('🧪 Testando validação...');
    
    // Teste 1: Sem body
    console.log('\n1️⃣ Teste sem body...');
    const noBodyResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'admin_session=authenticated'
      }
    });
    
    // Teste 2: Body vazio
    console.log('\n2️⃣ Teste com body vazio...');
    const emptyBodyResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'admin_session=authenticated'
      }
    }, {});
    
    // Teste 3: Sem userId
    console.log('\n3️⃣ Teste sem userId...');
    const noUserIdResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'admin_session=authenticated'
      }
    }, { otherField: 'test' });
    
    // Teste 4: Com userId válido
    console.log('\n4️⃣ Teste com userId válido...');
    const validUserIdResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'admin_session=authenticated'
      }
    }, { userId: 'test-user-id' });
    
    console.log('✅ Testes concluídos');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testValidation(); 