import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

export async function GET(req: NextRequest) {
  try {
    // Teste 1: Verificar se conseguimos conectar
    const projectId = db.app.options.projectId
    
    // Teste 2: Tentar ler dados
    const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    // Teste 3: Tentar escrever dados
    const testData = {
      title: 'Teste de Conexão',
      content: 'Este é um teste para verificar se o Firebase está funcionando',
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'blog'), testData)
    
    // Limpar o documento de teste
    // Note: Não vamos deletar aqui para não interferir com outros testes
    
    return NextResponse.json({
      success: true,
      message: 'Firebase está funcionando corretamente',
      projectId,
      readCount: snapshot.docs.length,
      writeId: docRef.id
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
} 