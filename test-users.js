const { getAdminFirestore } = require('./lib/firebase-admin');

async function testUsers() {
  try {
    console.log('🔍 Testando dados de usuários no Firestore...');
    
    const db = getAdminFirestore();
    if (!db) {
      console.error('❌ Erro: Não foi possível conectar ao Firestore');
      return;
    }

    // Listar todos os usuários
    const usersSnapshot = await db.collection('users').limit(10).get();
    
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários`);
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado no Firestore');
      return;
    }
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`\n👤 Usuário: ${userData.username || userData.email || doc.id}`);
      console.log(`📧 Email: ${userData.email || 'N/A'}`);
      console.log(`📸 photoURL: ${userData.photoURL || 'N/A'}`);
      console.log(`👥 Tipo: ${userData.userType || 'N/A'}`);
      console.log(`⭐ Premium: ${userData.premium || userData.isPremium || false}`);
      console.log(`✅ Verificado: ${userData.verified || userData.isVerified || false}`);
      console.log(`📅 Criado em: ${userData.createdAt || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao testar usuários:', error);
  }
}

testUsers(); 