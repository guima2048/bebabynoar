// Teste de autenticação admin e exclusão de usuário
async function testAdminAuth() {
  try {
    console.log('🧪 Testando autenticação admin...');
    
    // 1. Verificar se está autenticado
    const authResponse = await fetch('http://localhost:3000/api/admin/check-auth', {
      credentials: 'include'
    });
    
    const authData = await authResponse.json();
    console.log('🔐 Status de autenticação:', {
      status: authResponse.status,
      authenticated: authData.authenticated
    });
    
    if (!authData.authenticated) {
      console.log('❌ Não está autenticado como admin');
      return;
    }
    
    // 2. Testar endpoint de exclusão
    console.log('🗑️ Testando endpoint de exclusão...');
    
    const deleteResponse = await fetch('http://localhost:3000/api/admin/manage-user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: 'test-user-id',
        adminNotes: 'Teste de exclusão'
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

testAdminAuth(); 