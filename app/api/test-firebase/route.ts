import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

export async function GET(req: NextRequest) {
  try {
    console.log('Testando conexão com Firebase...')
    
    // Teste 1: Verificar se conseguimos conectar
    console.log('Firebase config:', {
      projectId: db.app.options.projectId,
      databaseId: db.app.options.databaseId
    })
    
    // Teste 2: Tentar ler dados
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    console.log('Leitura bem-sucedida, documentos encontrados:', snapshot.docs.length)
    
    // Teste 3: Tentar escrever dados
    const testData = {
      title: 'Teste de Conexão',
      content: 'Este é um teste para verificar se o Firebase está funcionando',
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('Tentando escrever dados de teste...')
    const docRef = await addDoc(collection(db, 'blog'), testData)
    console.log('Escrita bem-sucedida, ID:', docRef.id)
    
    // Limpar o documento de teste
    console.log('Limpando documento de teste...')
    // Note: Não vamos deletar aqui para não interferir com outros testes
    
    return NextResponse.json({
      success: true,
      message: 'Firebase está funcionando corretamente',
      readCount: snapshot.docs.length,
      writeId: docRef.id
    })
    
  } catch (error) {
    console.error('Erro no teste do Firebase:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
} 