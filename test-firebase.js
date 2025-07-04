// Teste simples do Firebase
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Configuração do Firebase (copie do seu .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyAx4P7F54DQ6Q6goN0glnTkwiem20tXFgs",
  authDomain: "bebaby-56627.firebaseapp.com",
  projectId: "bebaby-56627",
  storageBucket: "bebaby-56627.appspot.com",
  messagingSenderId: "551312783441",
  appId: "1:551312783441:web:d2db514ee6331a1767e070",
  measurementId: "G-283X7Q6YYR"
};

console.log('🔍 Testando configuração do Firebase...');

try {
  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App inicializado com sucesso');
  
  // Testar Auth
  const auth = getAuth(app);
  console.log('✅ Firebase Auth inicializado com sucesso');
  
  console.log('🎉 Firebase está funcionando corretamente!');
  
} catch (error) {
  console.error('❌ Erro no Firebase:', error.message);
  console.error('Detalhes:', error);
} 