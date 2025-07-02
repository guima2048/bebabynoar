import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  story: string;
  rating: number;
  photo: string;
  isActive: boolean;
}

interface ProfileCard {
  id: string;
  name: string;
  location: string;
  profession: string;
  photo: string;
  isActive: boolean;
}

interface LandingSettings {
  id: string;
  
  // Banner Principal
  bannerImageURL: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerDescription: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  
  // Seções
  testimonials: Testimonial[];
  sugarBabies: ProfileCard[];
  sugarDaddies: ProfileCard[];
  
  // Configurações Gerais
  isActive: boolean;
  updatedAt: string;
}

export async function GET() {
  console.log('🔍 Buscando configurações da landing page...')
  
  try {
    console.log('📡 Obtendo Firestore Admin...')
    const db = getAdminFirestore();
    console.log('✅ Firestore Admin obtido com sucesso')

    // Buscar configurações ativas, ordenadas por data de atualização
    console.log('🔍 Executando query no Firestore...')
    const settingsQuery = db
      .collection('landing_settings')
      .where('isActive', '==', true)
      .orderBy('updatedAt', 'desc')
      .limit(1);
    
    console.log('📥 Buscando documentos...')
    const snapshot = await settingsQuery.get();
    console.log('✅ Query executada, documentos encontrados:', snapshot.size)
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data() as LandingSettings;
      console.log('📄 Documento encontrado:', doc.id)
      console.log('📊 Dados do documento:', {
        bannerTitle: data.bannerTitle,
        testimonialsCount: data.testimonials?.length || 0,
        sugarBabiesCount: data.sugarBabies?.length || 0,
        sugarDaddiesCount: data.sugarDaddies?.length || 0
      })
      return NextResponse.json({ ...data, id: doc.id });
    } else {
      console.log('📝 Nenhum documento encontrado, retornando configurações padrão')
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
        testimonials: [
          {
            id: 'testimonial-1',
            name: "Isabella, 24",
            location: "São Paulo",
            story: "Conheci meu Sugar Daddy há 2 anos. Hoje viajamos pelo mundo juntos e tenho uma vida que sempre sonhei.",
            rating: 5,
            photo: "testimonial-1",
            isActive: true
          },
          {
            id: 'testimonial-2',
            name: "Roberto, 45",
            location: "Rio de Janeiro",
            story: "O Bebaby App me conectou com pessoas incríveis. A verificação de perfis me dá total segurança.",
            rating: 5,
            photo: "testimonial-2",
            isActive: true
          },
          {
            id: 'testimonial-3',
            name: "Camila, 26",
            location: "Brasília",
            story: "Em apenas 3 meses, encontrei meu parceiro ideal. A plataforma é realmente exclusiva e segura.",
            rating: 5,
            photo: "testimonial-3",
            isActive: true
          }
        ],
        sugarBabies: [
          {
            id: 'baby-1',
            name: "Ana, 23",
            location: "São Paulo",
            profession: "Secretária",
            photo: "baby-1",
            isActive: true
          },
          {
            id: 'baby-2',
            name: "Maria, 20",
            location: "Belo Horizonte",
            profession: "Universitária",
            photo: "baby-2",
            isActive: true
          },
          {
            id: 'baby-3',
            name: "Julia, 25",
            location: "Florianópolis",
            profession: "Estudante",
            photo: "baby-3",
            isActive: true
          },
          {
            id: 'baby-4',
            name: "Sofia, 22",
            location: "Rio de Janeiro",
            profession: "Recepcionista",
            photo: "baby-4",
            isActive: true
          }
        ],
        sugarDaddies: [
          {
            id: 'daddy-1',
            name: "Carlos, 45",
            location: "São Paulo",
            profession: "Empresário",
            photo: "daddy-1",
            isActive: true
          },
          {
            id: 'daddy-2',
            name: "Roberto, 52",
            location: "Rio de Janeiro",
            profession: "Advogado",
            photo: "daddy-2",
            isActive: true
          },
          {
            id: 'daddy-3',
            name: "Dr. Paulo, 48",
            location: "Brasília",
            profession: "Médico",
            photo: "daddy-3",
            isActive: true
          },
          {
            id: 'daddy-4',
            name: "Marcos, 50",
            location: "Belo Horizonte",
            profession: "Executivo",
            photo: "daddy-4",
            isActive: true
          }
        ],
        isActive: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('💥 Erro detalhado ao buscar configurações da landing page:')
    console.error('   Tipo do erro:', error?.constructor?.name || 'Unknown')
    console.error('   Mensagem:', error?.message || 'Erro desconhecido')
    console.error('   Stack:', error?.stack || 'Sem stack trace')
    
    if (error?.code) {
      console.error('   Código do erro:', error.code)
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao buscar configurações',
        details: error?.message || 'Erro desconhecido',
        code: error?.code || 'unknown'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('💾 Salvando configurações da landing page...')
  
  try {
    console.log('📡 Obtendo Firestore Admin...')
    const db = getAdminFirestore();
    console.log('✅ Firestore Admin obtido com sucesso')

    const settings: LandingSettings = await request.json();
    console.log('📄 Dados recebidos:', {
      bannerTitle: settings.bannerTitle,
      testimonialsCount: settings.testimonials?.length || 0,
      sugarBabiesCount: settings.sugarBabies?.length || 0,
      sugarDaddiesCount: settings.sugarDaddies?.length || 0
    })
    
    // Desativar configurações anteriores
    console.log('🔍 Buscando configurações ativas existentes...')
    const existingQuery = db
      .collection('landing_settings')
      .where('isActive', '==', true);
    const existingSnapshot = await existingQuery.get();
    console.log('📊 Configurações ativas encontradas:', existingSnapshot.size)
    
    const batch = db.batch();
    
    // Desativar configurações existentes
    console.log('❌ Desativando configurações existentes...')
    existingSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    
    // Adicionar nova configuração
    const newSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    console.log('➕ Adicionando nova configuração...')
    const newDocRef = db.collection('landing_settings').doc();
    batch.set(newDocRef, newSettings);
    
    console.log('💾 Executando batch write...')
    await batch.commit();
    console.log('✅ Configurações salvas com sucesso! ID:', newDocRef.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configurações da landing page atualizadas com sucesso',
      id: newDocRef.id
    });
  } catch (error: any) {
    console.error('💥 Erro detalhado ao salvar configurações da landing page:')
    console.error('   Tipo do erro:', error?.constructor?.name || 'Unknown')
    console.error('   Mensagem:', error?.message || 'Erro desconhecido')
    console.error('   Stack:', error?.stack || 'Sem stack trace')
    
    if (error?.code) {
      console.error('   Código do erro:', error.code)
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao salvar configurações',
        details: error?.message || 'Erro desconhecido',
        code: error?.code || 'unknown'
      },
      { status: 500 }
    );
  }
} 