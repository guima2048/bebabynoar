import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreDB } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface LandingSettings {
  id: string;
  bannerImageURL: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerDescription: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  isActive: boolean;
  updatedAt: string;
}

export async function GET() {
  try {
    const db = getFirestoreDB();
    if (!db) {
      throw new Error('Erro de configuração do banco de dados');
    }

    // Buscar configurações ativas, ordenadas por data de atualização
    const settingsQuery = query(
      collection(db, 'landing_settings'),
      where('isActive', '==', true),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(settingsQuery);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data() as LandingSettings;
      return NextResponse.json({ ...data, id: doc.id });
    } else {
      // Retornar configurações padrão se não houver configurações ativas
      return NextResponse.json({
        id: 'default',
        bannerImageURL: '',
        bannerTitle: 'A Maior Rede Sugar do Brasil',
        bannerSubtitle: 'Mulheres Lindas, Homens Ricos',
        bannerDescription: 'Encontre sua conexão perfeita no Bebaby App. A plataforma mais confiável e segura para Sugar Babies e Sugar Daddies encontrarem relacionamentos genuínos.',
        primaryButtonText: 'Cadastre-se Grátis',
        primaryButtonLink: '/register',
        secondaryButtonText: 'Explorar Perfis',
        secondaryButtonLink: '/explore',
        isActive: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Erro ao buscar configurações da landing page:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
} 