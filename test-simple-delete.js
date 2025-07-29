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
        console.log('📡 Headers:', res.headers);
        console.log('📡 Body:', body);
        
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

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testSimpleDelete() {
  try {
    console.log('🧪 Teste simples de exclusão...');
    
    // Teste 1: Login
    console.log('\n1️⃣ Testando login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }, {
      username: 'admin',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
    });
    
    console.log('✅ Login concluído');
    
    // Pegar cookies
    let cookies = '';
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'].join('; ');
      console.log('🍪 Cookies:', cookies);
    }
    
    // Teste 2: Buscar usuários
    console.log('\n2️⃣ Buscando usuários...');
    const usersResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/admin/premium-users',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (usersResponse.statusCode === 200 && usersResponse.data.users) {
      const users = usersResponse.data.users;
      console.log(`✅ Encontrados ${users.length} usuários`);
      
      // Encontrar usuário para excluir
      const userToDelete = users.find(u => !u.isAdmin);
      if (userToDelete) {
        console.log(`🎯 Usuário para excluir: ${userToDelete.username} (${userToDelete.id})`);
        
        // Teste 3: Excluir usuário
        console.log('\n3️⃣ Excluindo usuário...');
        const deleteResponse = await makeRequest({
          hostname: 'localhost',
          port: 3001,
          path: '/api/admin/manage-user',
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
          }
        }, {
          userId: userToDelete.id
        });
        
        console.log('✅ Teste de exclusão concluído');
      } else {
        console.log('❌ Nenhum usuário não-admin encontrado');
      }
    } else {
      console.log('❌ Erro ao buscar usuários');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testSimpleDelete(); 