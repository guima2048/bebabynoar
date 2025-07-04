const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../firebase-admin.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testIpRegistration() {
  try {
    console.log('🧪 Testando registro de IP...');
    
    // Simular dados de um usuário
    const userId = 'test-user-id';
    const testIp = '8.8.8.8'; // IP do Google para teste
    
    // Testar obtenção de localização
    console.log('📍 Obtendo localização do IP:', testIp);
    const locationResponse = await fetch(`https://ipapi.co/${testIp}/json/`);
    if (locationResponse.ok) {
      const locationData = await locationResponse.json();
      const ipLocation = `${locationData.city || ''}, ${locationData.region || ''}, ${locationData.country_name || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',');
      console.log('📍 Localização obtida:', ipLocation);
      
      // Registrar no banco
      await db.collection('userLogins').add({
        userId,
        ip: testIp,
        ipLocation,
        timestamp: new Date(),
        userAgent: 'Test Script'
      });
      
      // Atualizar usuário
      await db.collection('users').doc(userId).update({
        lastLoginIp: testIp,
        lastLoginIpLocation: ipLocation,
        lastLoginAt: new Date()
      });
      
      console.log('✅ Registro de IP testado com sucesso!');
    } else {
      console.log('❌ Erro ao obter localização do IP');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

testIpRegistration(); 