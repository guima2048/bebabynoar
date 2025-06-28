import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyAx4P7F54DQ6Q6goN0glnTkwiem20tXFgs",
  authDomain: "bebaby-56627.firebaseapp.com",
  projectId: "bebaby-56627",
  storageBucket: "bebaby-56627.firebasestorage.app",
  messagingSenderId: "551312783441",
  appId: "1:551312783441:web:d2db514ee6331a1767e070",
  measurementId: "G-283X7Q6YYR"
}

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services - sempre disponível
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Auth only in browser to avoid build issues
export const auth = typeof window !== 'undefined' ? getAuth(app) : null

// Initialize Analytics only in browser
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

// Export Firestore functions for convenience
export { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp }

export default app 