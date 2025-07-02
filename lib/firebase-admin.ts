// --- SERVER (API) ---
import * as admin from 'firebase-admin'
import { readFileSync } from 'fs'
import path from 'path'

// Carrega o JSON manualmente, independente de variáveis de ambiente
const serviceAccount = JSON.parse(
  readFileSync(path.resolve(process.cwd(), 'serviceAccountKey.json'), 'utf-8')
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'bebaby-56627.firebasestorage.app', // Seu bucket real
    projectId: 'bebaby-56627',
  })
}

// Helpers para SERVER
export function getAdminFirestore() {
  return admin.firestore()
}

export function getAdminStorage() {
  return admin.storage().bucket()
}

export default admin 