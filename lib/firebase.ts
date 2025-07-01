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

// Initialize Firebase only if configured and not during build time
let app: FirebaseApp | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let auth: Auth | null = null
let analytics: Analytics | null = null

// Only initialize if configured and not during build time
if (isFirebaseConfigured() && (typeof window !== 'undefined' || process.env.NODE_ENV === 'production')) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    db = getFirestore(app)
    storage = getStorage(app)
    auth = getAuth(app)
    
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app)
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error)
  }
}

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return db !== null && storage !== null && auth !== null
}

// Export Firebase services - sempre disponível
export { db, storage, auth, analytics }

// Export Firestore functions for convenience
export { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp }

export default app 