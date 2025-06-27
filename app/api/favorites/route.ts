import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore'

// Interfaces TypeScript
interface FavoriteData {
  id: string
  userId: string
  targetUserId: string
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
  isOnline?: boolean
  lastActiveAt?: any
}

export async function POST(request: NextRequest) {
  try {
    const { userId, targetUserId } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário e ID do alvo são obrigatórios' },
        { status: 400 }
      )
    }

    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Não é possível favoritar a si mesmo' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o alvo existe
    const targetRef = doc(db, 'users', targetUserId)
    const targetDoc = await getDoc(targetRef)
    if (!targetDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário alvo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se já é favorito
    const favoriteRef = doc(db, 'favorites', `${userId}_${targetUserId}`)
    const favoriteDoc = await getDoc(favoriteRef)
    
    if (favoriteDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário já está nos favoritos' },
        { status: 400 }
      )
    }

    // Adicionar aos favoritos
    await setDoc(favoriteRef, {
      userId,
      targetUserId,
      createdAt: new Date(),
      userType: userDoc.data().userType,
      targetUserType: targetDoc.data().userType,
    })

    // Notificar o usuário alvo (se configurado)
    if (process.env.BREVO_API_KEY) {
      const targetData = targetDoc.data()
      const userData = userDoc.data()
      
      const emailData = {
        to: [{ email: targetData.email }],
        subject: 'Você tem um novo admirador! - Bebaby App',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ec4899;">Bebaby App</h2>
            <p>Olá ${targetData.name || 'Usuário'}!</p>
            <p>${userData.name || 'Alguém'} adicionou você aos favoritos!</p>
            <p>Que tal dar uma olhada no perfil dessa pessoa?</p>
            <p style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/${userData.id}" 
                 style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Perfil
              </a>
            </p>
            <p>Atenciosamente,<br>Equipe Bebaby App</p>
          </div>
        `
      }

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify(emailData),
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário adicionado aos favoritos' 
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
    const { userId, targetUserId } = await request.json()

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário e ID do alvo são obrigatórios' },
        { status: 400 }
      )
    }

    // Remover dos favoritos
    const favoriteRef = doc(db, 'favorites', `${userId}_${targetUserId}`)
    const favoriteDoc = await getDoc(favoriteRef)
    
    if (!favoriteDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuário não está nos favoritos' },
        { status: 404 }
      )
    }

    await deleteDoc(favoriteRef)

    return NextResponse.json({ 
      success: true, 
      message: 'Usuário removido dos favoritos' 
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar favoritos do usuário
    const favoritesRef = collection(db, 'favorites')
    const q = query(
      favoritesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const favorites = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FavoriteData[]

    // Buscar dados dos usuários favoritados
    const favoriteUsers = await Promise.all(
      favorites.map(async (favorite) => {
        const userRef = doc(db, 'users', favorite.targetUserId)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData
          return {
            ...favorite,
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
              isOnline: userData.isOnline || false,
              lastActiveAt: userData.lastActiveAt,
            }
          }
          return null
        }
        return null
      })
    )

    // Filtrar usuários que ainda existem
    const validFavorites = favoriteUsers.filter(favorite => favorite !== null)

    return NextResponse.json({
      favorites: validFavorites,
      count: validFavorites.length,
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 