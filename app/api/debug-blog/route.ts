import { NextResponse } from 'next/server'
import { getFirestoreDB, collection, getDocs } from '@/lib/firebase'

export async function GET() {
  try {
    const db = getFirestoreDB()
    const snap = await getDocs(collection(db, 'blog'))
    const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 })
  }
} 