const { getAdminFirestore } = require('./lib/firebase-admin');

async function testExploreUsers() {
  try {
    console.log('🔍 Testando usuários para a página explore...');
    
    const db = getAdminFirestore();
    if (!db) {
      console.error('❌ Erro: Não foi possível conectar ao Firestore');
      return;
    }

    // 1. Buscar TODOS os usuários (sem filtros)
    console.log('\n📊 1. TODOS os usuários no Firestore:');
    const allUsersSnapshot = await db.collection('users').limit(20).get();
    console.log(`Total encontrado: ${allUsersSnapshot.size} usuários`);
    
    if (allUsersSnapshot.empty) {
      console.log('❌ Nenhum usuário encontrado no Firestore');
      return;
    }
    
    allUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`\n👤 ID: ${doc.id}`);
      console.log(`   Nome: ${userData.username || userData.email || 'N/A'}`);
      console.log(`   Email: ${userData.email || 'N/A'}`);
      console.log(`   Tipo: ${userData.userType || 'N/A'}`);
      console.log(`   isActive: ${userData.isActive || 'NÃO DEFINIDO'}`);
      console.log(`   Premium: ${userData.premium || userData.isPremium || false}`);
      console.log(`   Verificado: ${userData.verified || userData.isVerified || false}`);
      console.log(`   Criado em: ${userData.createdAt || 'N/A'}`);
      console.log(`   photoURL: ${userData.photoURL ? '✅ TEM FOTO' : '❌ SEM FOTO'}`);
    });

    // 2. Buscar usuários com filtro isActive = true
    console.log('\n📊 2. Usuários com isActive = true:');
    const activeUsersSnapshot = await db.collection('users')
      .where('isActive', '==', true)
      .limit(10)
      .get();
    console.log(`Usuários ativos encontrados: ${activeUsersSnapshot.size}`);
    
    activeUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`   ✅ ${userData.username || userData.email} (${doc.id})`);
    });

    // 3. Buscar usuários SEM o campo isActive
    console.log('\n📊 3. Usuários SEM campo isActive:');
    const usersWithoutActive = [];
    allUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.isActive === undefined) {
        usersWithoutActive.push({
          id: doc.id,
          username: userData.username || userData.email,
          userType: userData.userType
        });
      }
    });
    console.log(`Usuários sem isActive: ${usersWithoutActive.length}`);
    usersWithoutActive.forEach(user => {
      console.log(`   ⚠️  ${user.username} (${user.id}) - Tipo: ${user.userType}`);
    });

    // 4. Simular a query da API explore
    console.log('\n📊 4. Simulando query da API explore:');
    try {
      const exploreQuery = db.collection('users')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(50);
      
      const exploreSnapshot = await exploreQuery.get();
      console.log(`Usuários que apareceriam na explore: ${exploreSnapshot.size}`);
      
      if (exploreSnapshot.empty) {
        console.log('❌ NENHUM usuário apareceria na explore com a regra atual!');
        console.log('💡 Isso explica por que não há fotos aparecendo.');
      } else {
        exploreSnapshot.forEach(doc => {
          const userData = doc.data();
          console.log(`   ✅ ${userData.username || userData.email} (${doc.id})`);
        });
      }
    } catch (error) {
      console.log('❌ Erro na query explore:', error.message);
    }

    // 5. Sugestão de correção
    console.log('\n💡 SUGESTÃO DE CORREÇÃO:');
    console.log('A regra atual filtra apenas usuários com isActive = true.');
    console.log('Se os usuários não têm esse campo, eles não aparecem.');
    console.log('Soluções possíveis:');
    console.log('1. Remover o filtro isActive da query');
    console.log('2. Definir isActive = true para todos os usuários existentes');
    console.log('3. Usar uma query que inclua usuários sem o campo isActive');

  } catch (error) {
    console.error('❌ Erro ao testar usuários:', error);
  }
}

testExploreUsers(); 