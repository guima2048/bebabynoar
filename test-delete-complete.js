// Teste completo de exclusão com autenticação
const http = require('http');

function makeRequest(options, data = null, timeout = 10000) {
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

async function testCompleteDelete() {
  try {
    console.log('🧪 Teste completo de exclusão...');
    
    // 1. Login admin
    console.log('\n1️⃣ Fazendo login admin...');
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
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login falhou');
      return;
    }
    
    console.log('✅ Login bem-sucedido');
    
    // Pegar cookies
    let cookies = '';
    if (loginResponse.headers['set-cookie']) {
      cookies = loginResponse.headers['set-cookie'].join('; ');
      console.log('🍪 Cookies:', cookies);
    }
    
    // 2. Buscar usuários
    console.log('\n2️⃣ Buscando usuários...');
    const usersResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
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
    console.log(`✅ Encontrados ${users.length} usuários`);
    
    // Encontrar usuário para excluir (que esteja ativo)
    const userToDelete = users.find(u => !u.isAdmin && u.ativo === true);
    if (!userToDelete) {
      console.log('❌ Nenhum usuário não-admin ativo encontrado');
      return;
    }
    
    console.log(`🎯 Usuário para excluir: ${userToDelete.username} (${userToDelete.id})`);
    console.log(`📊 Status do usuário: ativo=${userToDelete.ativo}, premium=${userToDelete.premium}`);
    
    // 3. Excluir usuário
    console.log('\n3️⃣ Excluindo usuário...');
    const deleteData = {
      userId: userToDelete.id
    };
    console.log('📦 Dados enviados:', deleteData);
    
    const deleteResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/manage-user',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    }, deleteData);
    
    if (deleteResponse.statusCode === 200) {
      console.log('✅ Usuário excluído com sucesso!');
      
      // 4. Verificar se foi realmente excluído
      console.log('\n4️⃣ Verificando exclusão...');
      const verifyResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
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
      console.log('❌ Resposta completa:', deleteResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testCompleteDelete(); 