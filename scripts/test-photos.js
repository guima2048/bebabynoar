const { getAdminFirestore } = require('../lib/firebase-admin');

async function testPhotos() {
  try {
    console.log('🔍 Testando dados de fotos no Firestore...');
    
    const db = getAdminFirestore();
    if (!db) {
      console.error('❌ Erro: Não foi possível conectar ao Firestore');
      return;
    }

    // Listar todos os usuários
    const usersSnapshot = await db.collection('users').limit(5).get();
    
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários`);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`\n👤 Usuário: ${userData.username || userData.email || doc.id}`);
      console.log(`📸 photoURL: ${userData.photoURL || 'N/A'}`);
      console.log(`📸 Array photos:`, userData.photos || []);
      console.log(`📸 Número de fotos: ${(userData.photos || []).length}`);
      
      if (userData.photos && userData.photos.length > 0) {
        userData.photos.forEach((photo, index) => {
          console.log(`  📷 Foto ${index + 1}:`, {
            id: photo.id,
            url: photo.url,
            photoURL: photo.photoURL,
            isPrivate: photo.isPrivate,
            uploadedAt: photo.uploadedAt
          });
        });
      }
    });

  } catch (error) {
    console.error('❌ Erro ao testar fotos:', error);
  }
}

testPhotos(); 