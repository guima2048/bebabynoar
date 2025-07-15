const http = require('http');
const querystring = require('querystring');

function testSimpleLogin() {
  console.log('🧪 Testando login simples...');
  
  // Dados básicos do login
  const loginData = {
    email: 'sugar_daddy1@example.com',
    password: '123456'
  };

  const postData = querystring.stringify(loginData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/signin/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('📊 Status:', res.statusCode);
    console.log('📊 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Resposta:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro:', error.message);
  });

  req.write(postData);
  req.end();
}

testSimpleLogin(); 