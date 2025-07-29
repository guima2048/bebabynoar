// Teste do sistema admin sem CSRF
async function testAdminNoCSRF() {
  try {
    console.log('🧪 Testando sistema admin sem CSRF...');
    
    // 1. Testar login admin
    console.log('🔐 Testando login admin...');
    const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Resposta do login:', {
      status: loginResponse.status,
      success: loginData.success,
      message: loginData.message
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login falhou');
      return;
    }
    
    // 2. Testar verificação de autenticação
    console.log('🔍 Testando verificação de auth...');
    const authResponse = await fetch('http://localhost:3000/api/admin/check-auth', {
      credentials: 'include'
    });
    
    const authData = await authResponse.json();
    console.log('🔍 Status de autenticação:', {
      status: authResponse.status,
      authenticated: authData.authenticated
    });
    
    if (!authData.authenticated) {
      console.log('❌ Não está autenticado');
      return;
    }
    
    // 3. Testar endpoint de exclusão (sem CSRF)
    console.log('🗑️ Testando exclusão sem CSRF...');
    const deleteResponse = await fetch('http://localhost:3000/api/admin/manage-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: 'test-user-id',
        adminNotes: 'Teste sem CSRF'
      })
    });
    
    const deleteData = await deleteResponse.json();
    console.log('🗑️ Resposta da exclusão:', {
      status: deleteResponse.status,
      success: deleteData.success,
      message: deleteData.message,
      error: deleteData.error
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testAdminNoCSRF(); 