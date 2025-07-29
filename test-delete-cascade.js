// Teste de exclusão em cascata
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

async function testCascadeDelete() {
  try {
    console.log('🧪 Testando exclusão em cascata...');
    
    // Login
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin123' });
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login falhou');
      return;
    }
    
    // Buscar usuários
    const usersResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/premium-users',
      method: 'GET',
      headers: { 'Cookie': 'admin_session=authenticated' }
    });
    
    if (usersResponse.statusCode !== 200) {
      console.log('❌ Erro ao buscar usuários');
      return;
    }
    
    const users = JSON.parse(usersResponse.data).users;
    console.log(`📊 Encontrados ${users.length} usuários`);
    
    // Encontrar usuário com menos dados relacionados
    const userToDelete = users.find(u => !u.isAdmin && u.photoCount === 0 && u.messageCount === 0);
    
    if (!userToDelete) {
      console.log('❌ Nenhum usuário simples encontrado');
      return;
    }
    
    console.log(`🎯 Usuário para excluir: ${userToDelete.username}`);
    console.log(`📊 Dados relacionados: photos=${userToDelete.photoCount}, messages=${userToDelete.messageCount}`);
    
    // Teste de exclusão
    console.log('\n🗑️ Excluindo usuário...');
    const startTime = Date.now();
    
    const deleteResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'admin_session=authenticated'
      }
    }, { userId: userToDelete.id });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Tempo de exclusão: ${duration}ms`);
    console.log('✅ Teste concluído');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testCascadeDelete(); 