const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAx4P7F54DQ6Q6goN0glnTkwiem20tXFgs",
  authDomain: "bebaby-56627.firebaseapp.com",
  projectId: "bebaby-56627",
  storageBucket: "bebaby-56627.firebasestorage.app",
  messagingSenderId: "551312783441",
  appId: "1:551312783441:web:d2db514ee6331a1767e070",
  measurementId: "G-283X7Q6YYR"
};

async function testFirebaseConnection() {
  try {
    console.log('🔄 Iniciando teste de conexão com Firebase...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase inicializado com sucesso');
    
    // Testar escrita
    console.log('🔄 Testando escrita no Firestore...');
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Teste de conexão Firebase'
    };
    
    const docRef = await addDoc(collection(db, 'test_connection'), testData);
    console.log('✅ Documento criado com ID:', docRef.id);
    
    // Testar leitura
    console.log('🔄 Testando leitura do Firestore...');
    const q = query(collection(db, 'test_connection'), where('test', '==', true));
    const querySnapshot = await getDocs(q);
    
    console.log('✅ Leitura bem-sucedida. Documentos encontrados:', querySnapshot.size);
    
    // Testar landing_settings
    console.log('🔄 Testando acesso à coleção landing_settings...');
    const landingQuery = query(collection(db, 'landing_settings'));
    const landingSnapshot = await getDocs(landingQuery);
    
    console.log('✅ Coleção landing_settings acessível. Documentos:', landingSnapshot.size);
    
    if (landingSnapshot.size > 0) {
      console.log('📄 Documentos existentes na landing_settings:');
      landingSnapshot.forEach((doc) => {
        console.log(`  - ID: ${doc.id}, Ativo: ${doc.data().isActive || false}`);
      });
    } else {
      console.log('📝 Nenhum documento encontrado na landing_settings');
    }
    
    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    console.log('✅ Firebase está funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro no teste de conexão:', error);
    console.error('Detalhes do erro:', error.message);
    
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    
    if (error.message.includes('permission')) {
      console.error('💡 Possível problema de permissões no Firestore');
    }
    
    if (error.message.includes('network')) {
      console.error('💡 Possível problema de conectividade');
    }
  }
}

// Executar o teste
testFirebaseConnection(); 