// --- SERVER (API) ---
import * as admin from 'firebase-admin'
import { readFileSync } from 'fs'
import path from 'path'

// Função para obter as credenciais do Firebase
function getServiceAccount() {
  // Tenta usar variáveis de ambiente primeiro
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    return {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || 'bebaby-56627',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || ''
    } as admin.ServiceAccount
  }

  // Fallback: tenta ler o arquivo JSON
  try {
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json')
    return JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
  } catch (error) {
    console.error('Erro ao carregar credenciais do Firebase:', error)
    throw new Error('Credenciais do Firebase não encontradas. Configure as variáveis de ambiente ou o arquivo serviceAccountKey.json')
  }
}

// Inicializa o Firebase Admin apenas se não estiver em build
if (!admin.apps.length && process.env.NODE_ENV !== 'production' && !process.env.NEXT_PHASE) {
  try {
    const serviceAccount = getServiceAccount()
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'bebaby-56627.firebasestorage.app', // Seu bucket real
      projectId: 'bebaby-56627',
    })
  } catch (error) {
    console.warn('Firebase Admin não inicializado durante build:', (error as Error).message)
  }
}

// Helpers para SERVER
export function getAdminFirestore() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = getServiceAccount()
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'bebaby-56627.firebasestorage.app',
        projectId: 'bebaby-56627',
      })
    } catch (error) {
      throw new Error('Falha ao inicializar Firebase Admin: ' + (error as Error).message)
    }
  }
  return admin.firestore()
}

export function getAdminStorage() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = getServiceAccount()
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'bebaby-56627.firebasestorage.app',
        projectId: 'bebaby-56627',
      })
    } catch (error) {
      throw new Error('Falha ao inicializar Firebase Admin: ' + (error as Error).message)
    }
  }
  return admin.storage().bucket()
}

export default admin 