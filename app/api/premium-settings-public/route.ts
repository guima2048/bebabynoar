import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

const COLLECTION = 'premiumSettings';
const DOC_ID = 'features';

export async function GET(req: NextRequest) {
  const db = getAdminFirestore();
  const docRef = db.collection(COLLECTION).doc(DOC_ID);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return NextResponse.json({ features: {} });
  }
  return NextResponse.json({ features: docSnap.data() });
} 