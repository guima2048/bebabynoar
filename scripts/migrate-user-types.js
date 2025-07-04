const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'bebaby-56627.appspot.com'
  });
}

const db = admin.firestore();

// Mapeamento de tipos de usuário para gênero
const USER_TYPE_GENDER_MAP = {
  'sugar_baby': 'female',    // Mulher que busca benefícios
  'sugar_daddy': 'male',     // Homem que oferece benefícios
  'sugar_mommy': 'female',   // Mulher que oferece benefícios
  'sugar_babyboy': 'male'    // Homem que busca benefícios
};

// Mapeamento de tipos de usuário para preferências padrão
const USER_TYPE_LOOKING_FOR_MAP = {
  'sugar_baby': 'male',      // Sugar Baby procura homens
  'sugar_daddy': 'female',   // Sugar Daddy procura mulheres
  'sugar_mommy': 'male',     // Sugar Mommy procura homens
  'sugar_babyboy': 'female'  // Sugar Babyboy procura mulheres
};

async function migrateUsers() {
  console.log('🚀 Iniciando migração de tipos de usuário...');
  
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    console.log(`📊 Encontrados ${snapshot.size} usuários para migrar`);
    
    let migrated = 0;
    let errors = 0;
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      console.log(`\n👤 Processando usuário: ${userData.username || userId}`);
      
      const updates = {};
      let hasUpdates = false;
      
      // Verificar se precisa adicionar gênero
      if (!userData.gender && userData.userType) {
        const gender = USER_TYPE_GENDER_MAP[userData.userType];
        if (gender) {
          updates.gender = gender;
          hasUpdates = true;
          console.log(`  ✅ Adicionando gênero: ${gender}`);
        }
      }
      
      // Verificar se precisa adicionar lookingFor
      if (!userData.lookingFor && userData.userType) {
        const lookingFor = USER_TYPE_LOOKING_FOR_MAP[userData.userType];
        if (lookingFor) {
          updates.lookingFor = lookingFor;
          hasUpdates = true;
          console.log(`  ✅ Adicionando preferência: ${lookingFor}`);
        }
      }
      
      // Aplicar atualizações se necessário
      if (hasUpdates) {
        try {
          await doc.ref.update(updates);
          migrated++;
          console.log(`  ✅ Usuário migrado com sucesso`);
        } catch (error) {
          errors++;
          console.error(`  ❌ Erro ao migrar usuário ${userId}:`, error.message);
        }
      } else {
        console.log(`  ⏭️ Usuário já possui todos os campos necessários`);
      }
    }
    
    console.log(`\n🎉 Migração concluída!`);
    console.log(`✅ Usuários migrados: ${migrated}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📊 Total processado: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

// Executar migração
migrateUsers()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  }); 