// Teste do sistema admin simulando navegador
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAdminBrowser() {
  try {
    console.log('🧪 Testando sistema admin (simulando navegador)...');
    
    let cookies = '';
    
    // 1. Testar login admin
    console.log('🔐 Testando login admin...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('🔐 Resposta do login:', {
      status: loginResponse.statusCode,
      success: loginResponse.data.success,
      message: loginResponse.data.message
    });
    
    // Extrair cookies da resposta
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'].join('; ');
      console.log('🍪 Cookies recebidos:', cookies);
    }
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login falhou');
      return;
    }
    
    // 2. Testar verificação de autenticação com cookies
    console.log('🔍 Testando verificação de auth...');
    const authResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/check-auth',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('🔍 Status de autenticação:', {
      status: authResponse.statusCode,
      authenticated: authResponse.data.authenticated
    });
    
    if (!authResponse.data.authenticated) {
      console.log('❌ Não está autenticado');
      return;
    }
    
    // 3. Testar endpoint de exclusão (sem CSRF)
    console.log('🗑️ Testando exclusão sem CSRF...');
    const deleteResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    }, {
      userId: 'test-user-id',
      adminNotes: 'Teste sem CSRF'
    });
    
    console.log('🗑️ Resposta da exclusão:', {
      status: deleteResponse.statusCode,
      success: deleteResponse.data.success,
      message: deleteResponse.data.message,
      error: deleteResponse.data.error
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testAdminBrowser(); 