const { getAdminFirestore, getAdminStorage } = require('./../lib/firebase-admin');

async function testPhotoUpload() {
  try {
    console.log('🔍 Testando sistema de upload de fotos...');
    
    const db = getAdminFirestore();
    const storage = getAdminStorage();
    
    if (!db) {
      console.error('❌ Erro: Não foi possível conectar ao Firestore');
      return;
    }
    
    if (!storage) {
      console.error('❌ Erro: Não foi possível conectar ao Storage');
      return;
    }
    
    console.log('✅ Conexões estabelecidas com sucesso');
    
    // Listar usuários com fotos
    const usersSnapshot = await db.collection('users').limit(5).get();
    
    console.log(`📊 Encontrados ${usersSnapshot.size} usuários para teste`);
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const publicPhotos = userData.publicPhotos || [];
      const privatePhotos = userData.privatePhotos || [];
      const photos = userData.photos || [];
      
      console.log(`\n👤 Usuário: ${userData.username || userData.email || doc.id}`);
      console.log(`📸 Fotos públicas: ${publicPhotos.length}`);
      console.log(`🔒 Fotos privadas: ${privatePhotos.length}`);
      console.log(`📷 Fotos gerais: ${photos.length}`);
      
      // Verificar URLs das fotos
      if (publicPhotos.length > 0) {
        console.log('  📸 Fotos públicas:');
        publicPhotos.forEach((url, index) => {
          console.log(`    ${index + 1}. ${url.substring(0, 50)}...`);
        });
      }
      
      if (privatePhotos.length > 0) {
        console.log('  🔒 Fotos privadas:');
        privatePhotos.forEach((url, index) => {
          console.log(`    ${index + 1}. ${url.substring(0, 50)}...`);
        });
      }
      
      if (photos.length > 0) {
        console.log('  📷 Fotos gerais:');
        photos.forEach((photo, index) => {
          if (typeof photo === 'string') {
            console.log(`    ${index + 1}. ${photo.substring(0, 50)}...`);
          } else if (photo.url) {
            console.log(`    ${index + 1}. ${photo.url.substring(0, 50)}... (${photo.isPrivate ? 'Privada' : 'Pública'})`);
          }
        });
      }
    });
    
    // Testar regras do Storage
    console.log('\n🔍 Testando regras do Storage...');
    try {
      const testFile = storage.file('test-permissions.txt');
      await testFile.save('test', { contentType: 'text/plain' });
      console.log('✅ Upload de teste funcionou - regras podem estar muito permissivas');
      await testFile.delete();
    } catch (error) {
      console.log('❌ Upload de teste falhou:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar upload de fotos:', error);
  }
}

testPhotoUpload(); 