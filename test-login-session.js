const http = require('http');
const querystring = require('querystring');

function testLogin() {
  console.log('🧪 Testando login e sessão...');
  
  // Dados do login
  const loginData = {
    email: 'sugar_daddy1@example.com',
    password: '123456',
    callbackUrl: 'http://localhost:3001/profile',
    json: 'true'
  };

  const postData = querystring.stringify(loginData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('📊 Status do login:', res.statusCode);
    console.log('📊 Headers do login:', res.headers);
    
    // Pegar cookies da resposta
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      console.log('🍪 Cookies recebidos:', cookies);
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Resposta do login:', data);
      
      // Se o login foi bem-sucedido, testar a API de perfil com os cookies
      if (res.statusCode === 200 && cookies) {
        console.log('\n🔍 Testando API de perfil com sessão...');
        testProfileWithSession(cookies);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro no login:', error.message);
  });

  req.write(postData);
  req.end();
}

function testProfileWithSession(cookies) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/user/profile',
    method: 'GET',
    headers: {
      'Cookie': cookies.join('; ')
    }
  };

  const req = http.request(options, (res) => {
    console.log('📊 Status da API com sessão:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Resposta da API com sessão:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na API com sessão:', error.message);
  });

  req.end();
}

testLogin(); 