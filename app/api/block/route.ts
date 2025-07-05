import { NextRequest, NextResponse } from 'next/server'
import { getFirestoreDB } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore'

// Interfaces TypeScript
interface BlockData {
  id: string
  userId: string
  targetUserId: string
  reason: string
  createdAt: Date
  userType: string
  targetUserType: string
}

interface UserData {
  name?: string
  displayName?: string
  email: string
  userType: string
  age?: number
  location?: string
  bio?: string
  photos?: string[]
  isPremium?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }
    
    const { userId, targetUserId, reason } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'ID do usuário e ID do alvo são obrigatórios' }, { status: 400 })
    }

    if (userId === targetUserId) {
      return NextResponse.json({ error: 'Não é possível bloquear a si mesmo' }, { status: 400 })
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar se o alvo existe
    const targetRef = doc(db, 'users', targetUserId)
    const targetDoc = await getDoc(targetRef)
    if (!targetDoc.exists()) {
      return NextResponse.json({ error: 'Usuário alvo não encontrado' }, { status: 404 })
    }

    // Verificar se já está bloqueado
    const blockRef = doc(db, 'blocks', `${userId}_${targetUserId}`)
    const blockDoc = await getDoc(blockRef)
    
    if (blockDoc.exists()) {
      return NextResponse.json({ error: 'Usuário já está bloqueado' }, { status: 400 })
    }

    // Adicionar bloqueio
    await setDoc(blockRef, {
      userId,
      targetUserId,
      reason: reason || 'Bloqueio solicitado pelo usuário',
      createdAt: new Date(),
      userType: userDoc.data().userType,
      targetUserType: targetDoc.data().userType,
    })

    // Remover de favoritos se existir
    const favoriteRef = doc(db, 'favorites', `${userId}_${targetUserId}`)
    const favoriteDoc = await getDoc(favoriteRef)
    if (favoriteDoc.exists()) {
      await deleteDoc(favoriteRef)
    }

    // Remover favorito recíproco se existir
    const reciprocalFavoriteRef = doc(db, 'favorites', `${targetUserId}_${userId}`)
    const reciprocalFavoriteDoc = await getDoc(reciprocalFavoriteRef)
    if (reciprocalFavoriteDoc.exists()) {
      await deleteDoc(reciprocalFavoriteRef)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário bloqueado com sucesso' 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }
    
    const { userId, targetUserId } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'ID do usuário e ID do alvo são obrigatórios' }, { status: 400 })
    }

    // Remover bloqueio
    const blockRef = doc(db, 'blocks', `${userId}_${targetUserId}`)
    const blockDoc = await getDoc(blockRef)
    
    if (!blockDoc.exists()) {
      return NextResponse.json({ error: 'Usuário não está bloqueado' }, { status: 404 })
    }

    await deleteDoc(blockRef)

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário desbloqueado com sucesso' 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Buscar usuários bloqueados
    const blocksRef = collection(db, 'blocks')
    const q = query(
      blocksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const blocks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlockData[]

    // Buscar dados dos usuários bloqueados
    const blockedUsers = await Promise.all(
      blocks.map(async (block) => {
        const userRef = doc(db, 'users', block.targetUserId)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData
          return {
            ...block,
            targetUser: {
              id: userDoc.id,
              name: userData.name || userData.displayName || 'Usuário',
              email: userData.email,
              userType: userData.userType,
              age: userData.age,
              location: userData.location,
              bio: userData.bio,
              photos: userData.photos || [],
              isPremium: userData.isPremium || false,
            }
          }
        }
        return null
      })
    )

    // Filtrar usuários que ainda existem
    const validBlocks = blockedUsers.filter(block => block !== null)

    return NextResponse.json({
      blockedUsers: validBlocks,
      count: validBlocks.length,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 