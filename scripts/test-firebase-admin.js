const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.resolve('./serviceAccountKey.json');
console.log('Tentando carregar o arquivo:', serviceAccountPath);

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  console.log('Arquivo de credenciais lido com sucesso.');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'bebaby-56627.firebasestorage.app',
    projectId: 'bebaby-56627',
  });
  console.log('Firebase Admin SDK inicializado com sucesso.');

  // Testar acesso ao Firestore
  admin.firestore().collection('landing_settings').limit(1).get()
    .then(snapshot => {
      console.log('Firestore acessível. Documentos encontrados:', snapshot.size);
      process.exit(0);
    })
    .catch(error => {
      console.error('Erro ao acessar o Firestore:', error);
      process.exit(1);
    });

} catch (error) {
  console.error('Erro ao ler o arquivo de credenciais ou inicializar o Firebase Admin:', error);
  process.exit(1);
} 