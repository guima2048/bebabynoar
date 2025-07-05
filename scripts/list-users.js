const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('../firebase-admin.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'bebaby-56627.firebasestorage.app'
  });
}

const db = admin.firestore();

async function listAllUsers() {
  try {
    console.log('🔍 Buscando todos os usuários...\n');
    
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado.');
      return;
    }

    console.log(`📊 Total de usuários encontrados: ${usersSnapshot.size}\n`);
    
    let foundTonyy = false;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Campos de nome possíveis
      const username = userData.username || 'N/A';
      const name = userData.name || 'N/A';
      const displayName = userData.displayName || 'N/A';
      const email = userData.email || 'N/A';
      
      // Verificar se é o usuário TONYY
      const isTonyy = username.toLowerCase() === 'tonyy' || 
                     name.toLowerCase() === 'tonyy' || 
                     displayName.toLowerCase() === 'tonyy';
      
      if (isTonyy) {
        foundTonyy = true;
        console.log('🎯 === USUÁRIO TONYY ENCONTRADO ===');
        console.log(`ID: ${userId}`);
        console.log(`Username: ${username}`);
        console.log(`Name: ${name}`);
        console.log(`DisplayName: ${displayName}`);
        console.log(`Email: ${email}`);
        console.log(`UserType: ${userData.userType || 'N/A'}`);
        console.log(`Premium: ${userData.premium || false}`);
        console.log(`Ativo: ${userData.ativo !== false}`);
        console.log('=====================================\n');
      }
      
      // Listar todos os usuários (primeiros 20 para não sobrecarregar)
      if (usersSnapshot.docs.indexOf(doc) < 20) {
        console.log(`👤 ${username} (${name}) - ${email}`);
      }
    });
    
    if (!foundTonyy) {
      console.log('\n❌ Usuário "TONYY" não encontrado nos primeiros campos.');
      console.log('🔍 Verificando outros campos...\n');
      
      // Busca mais ampla
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        
        // Verificar todos os campos de texto
        const allFields = JSON.stringify(userData).toLowerCase();
        if (allFields.includes('tonyy')) {
          console.log('🎯 === POSSÍVEL MATCH ENCONTRADO ===');
          console.log(`ID: ${userId}`);
          console.log('Dados completos:', JSON.stringify(userData, null, 2));
          console.log('=====================================\n');
        }
      });
    }
    
    console.log('\n✅ Busca concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
  }
}

async function searchSpecificUser(searchTerm) {
  try {
    console.log(`🔍 Buscando usuário com termo: "${searchTerm}"\n`);
    
    const usersSnapshot = await db.collection('users').get();
    let found = false;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      const username = userData.username || '';
      const name = userData.name || '';
      const displayName = userData.displayName || '';
      const email = userData.email || '';
      
      if (username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase())) {
        
        found = true;
        console.log('🎯 === USUÁRIO ENCONTRADO ===');
        console.log(`ID: ${userId}`);
        console.log(`Username: ${username}`);
        console.log(`Name: ${name}`);
        console.log(`DisplayName: ${displayName}`);
        console.log(`Email: ${email}`);
        console.log(`UserType: ${userData.userType || 'N/A'}`);
        console.log(`Premium: ${userData.premium || false}`);
        console.log(`Ativo: ${userData.ativo !== false}`);
        console.log('=====================================\n');
      }
    });
    
    if (!found) {
      console.log(`❌ Nenhum usuário encontrado com o termo "${searchTerm}"`);
    }
    
  } catch (error) {
    console.error('❌ Erro na busca:', error);
  }
}

// Executar
async function main() {
  console.log('🚀 Iniciando busca de usuários...\n');
  
  // Listar todos os usuários
  await listAllUsers();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Buscar especificamente por TONYY
  await searchSpecificUser('tonyy');
  
  process.exit(0);
}

main().catch(console.error); 