import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('🔄 Testando conexão Firebase Admin na API...');
    
    const db = getAdminFirestore();
    console.log('✅ Firebase Admin inicializado na API');

    // Testar acesso à coleção landing_settings
    const landingSnapshot = await db.collection('landing_settings').get();
    
    console.log('✅ Coleção landing_settings acessível. Documentos:', landingSnapshot.size);

    const documents: Array<{id: string, data: any}> = [];
    landingSnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        data: doc.data()
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Conexão Firebase Admin funcionando na API',
      documentsCount: landingSnapshot.size,
      documents: documents
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 