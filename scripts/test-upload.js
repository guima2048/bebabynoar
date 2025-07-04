const { getAdminFirestore } = require('../lib/firebase-admin');

async function testUpload() {
  try {
    console.log('🔍 Testando sistema de upload...');
    
    const db = getAdminFirestore();
    if (!db) {
      console.error('❌ Erro: Não foi possível conectar ao Firestore');
      return;
    }

    // Listar usuários com fotos
    const usersSnapshot = await db.collection('users').limit(10).get();
    
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários`);
    
    let totalPhotos = 0;
    let usersWithPhotos = 0;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const photos = userData.photos || [];
      
      if (photos.length > 0) {
        usersWithPhotos++;
        totalPhotos += photos.length;
        
        console.log(`\n👤 Usuário: ${userData.username || userData.email || doc.id}`);
        console.log(`📸 Total de fotos: ${photos.length}`);
        
        // Verificar estrutura das fotos
        photos.forEach((photo, index) => {
          const hasId = photo.id ? '✅' : '❌';
          const hasUrl = photo.url ? '✅' : '❌';
          const hasPhotoURL = photo.photoURL ? '✅' : '❌';
          const isPrivate = photo.isPrivate ? '🔒' : '🌐';
          
          console.log(`  📷 Foto ${index + 1}: ${hasId} ID | ${hasUrl} URL | ${hasPhotoURL} photoURL | ${isPrivate} ${photo.isPrivate ? 'Privada' : 'Pública'}`);
          
          if (photo.url) {
            console.log(`     URL: ${photo.url.substring(0, 50)}...`);
          }
        });
      }
    });
    
    console.log(`\n📊 Resumo:`);
    console.log(`   Usuários com fotos: ${usersWithPhotos}/${usersSnapshot.size}`);
    console.log(`   Total de fotos: ${totalPhotos}`);
    
    // Verificar se há fotos com estrutura incorreta
    console.log(`\n🔍 Verificando estrutura das fotos...`);
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const photos = userData.photos || [];
      
      photos.forEach((photo, index) => {
        if (!photo.id || !photo.url) {
          console.log(`⚠️  Usuário ${doc.id} - Foto ${index + 1} tem estrutura incompleta:`, photo);
        }
      });
    });

  } catch (error) {
    console.error('❌ Erro ao testar upload:', error);
  }
}

testUpload(); 