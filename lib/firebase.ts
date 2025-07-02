// --- CLIENTE (browser) ---
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAnalytics, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Verificar se todas as variáveis de ambiente necessárias estão presentes
const isFirebaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  )
}

// --- CLIENTE ---
let app: FirebaseApp | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let auth: Auth | null = null
let analytics: Analytics | null = null

// Inicializar Firebase apenas uma vez
if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0]
  }
  
  db = getFirestore(app)
  storage = getStorage(app)
  auth = getAuth(app)
  
  // Analytics só funciona no browser
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.log('Analytics não disponível:', error)
  }
}

// Helpers para CLIENTE
export { db, storage, auth, analytics }
export { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp }

// Funções para compatibilidade (só funcionam no client)
export function getFirestoreDB() {
  if (typeof window === 'undefined') {
    throw new Error('getFirestoreDB só pode ser usado no client. Use getAdminFirestore() no server.')
  }
  if (!db) throw new Error('Firebase Firestore não está inicializado')
  return db
}

export function getFirebaseStorage() {
  if (typeof window === 'undefined') {
    throw new Error('getFirebaseStorage só pode ser usado no client. Use getAdminStorage() no server.')
  }
  if (!storage) throw new Error('Firebase Storage não está inicializado')
  return storage
}

export default app 