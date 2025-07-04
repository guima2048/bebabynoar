// Script para garantir que todos os usuários do Auth tenham documento completo no Firestore
const { getAdminFirestore } = require('../lib/firebase-admin');
const admin = require('../lib/firebase-admin').default;

async function fixUsers() {
  const db = getAdminFirestore();
  const auth = admin.auth();
  const users = [];
  let nextPageToken;

  // Buscar todos os usuários do Auth
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    users.push(...listUsersResult.users);
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);

  for (const user of users) {
    const userRef = db.collection('users').doc(user.uid);
    const docSnap = await userRef.get();
    if (!docSnap.exists) {
      // Criar documento mínimo
      await userRef.set({
        username: user.displayName || user.email.split('@')[0],
        email: user.email,
        userType: 'user',
        premium: false,
        verified: false,
        createdAt: new Date(),
      });
      console.log(`Documento criado para ${user.email}`);
    } else {
      // Corrigir campos ausentes
      const data = docSnap.data();
      const update = {};
      if (!data.username) update.username = user.displayName || user.email.split('@')[0];
      if (!data.userType) update.userType = 'user';
      if (typeof data.premium === 'undefined') update.premium = false;
      if (typeof data.verified === 'undefined') update.verified = false;
      if (!data.createdAt) update.createdAt = new Date();
      if (Object.keys(update).length > 0) {
        await userRef.update(update);
        console.log(`Documento atualizado para ${user.email}`);
      }
    }
  }
  console.log('Finalizado!');
}

fixUsers().catch(err => {
  console.error('Erro ao corrigir usuários:', err);
  process.exit(1);
}); 