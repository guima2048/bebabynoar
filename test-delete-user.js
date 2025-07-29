// Teste de exclusão real de usuário
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

async function testDeleteUser() {
  try {
    console.log('🧪 Testando exclusão real de usuário...');
    
    let cookies = '';
    
    // 1. Login admin
    console.log('🔐 Fazendo login admin...');
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
    
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'].join('; ');
    }
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login falhou');
      return;
    }
    
    // 2. Buscar usuários para encontrar um para excluir
    console.log('👥 Buscando usuários...');
    const usersResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/admin/premium-users',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (usersResponse.statusCode !== 200) {
      console.log('❌ Erro ao buscar usuários');
      return;
    }
    
    const users = usersResponse.data.users;
    console.log(`📊 Encontrados ${users.length} usuários`);
    
    // Encontrar um usuário que não seja admin para excluir
    const userToDelete = users.find(u => !u.isAdmin);
    
    if (!userToDelete) {
      console.log('❌ Nenhum usuário não-admin encontrado para excluir');
      return;
    }
    
    console.log(`🗑️ Excluindo usuário: ${userToDelete.username} (${userToDelete.id})`);
    
    // 3. Excluir usuário
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
      userId: userToDelete.id,
      adminNotes: 'Teste de exclusão real'
    });
    
    console.log('🗑️ Resposta da exclusão:', {
      status: deleteResponse.statusCode,
      success: deleteResponse.data.success,
      message: deleteResponse.data.message,
      error: deleteResponse.data.error,
      details: deleteResponse.data.details
    });
    
    if (deleteResponse.statusCode === 200) {
      console.log('✅ Usuário excluído com sucesso!');
      
      // 4. Verificar se o usuário foi realmente excluído
      console.log('🔍 Verificando se usuário foi excluído...');
      const verifyResponse = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/admin/premium-users',
        method: 'GET',
        headers: {
          'Cookie': cookies
        }
      });
      
      if (verifyResponse.statusCode === 200) {
        const remainingUsers = verifyResponse.data.users;
        const userStillExists = remainingUsers.find(u => u.id === userToDelete.id);
        
        if (userStillExists) {
          console.log('❌ Usuário ainda existe no banco!');
        } else {
          console.log('✅ Usuário foi realmente excluído do banco!');
        }
      }
    } else {
      console.log('❌ Falha na exclusão. Status:', deleteResponse.statusCode);
      console.log('❌ Erro completo:', deleteResponse.data);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testDeleteUser(); 