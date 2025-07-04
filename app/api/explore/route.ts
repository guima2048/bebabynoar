import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { filterVisibleUsers, User } from '@/lib/user-matching'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    let currentUser: any

    try {
      const auth = getAuth()
      const decodedToken = await auth.verifyIdToken(token)
      currentUser = decodedToken
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      )
    }

    const db = getAdminFirestore()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const userType = searchParams.get('userType')
    const isPremium = searchParams.get('isPremium')
    const isVerified = searchParams.get('isVerified')

    let query = db.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(limit * 2) // Buscar mais para compensar o filtro

    // Aplicar filtros se fornecidos
    if (userType) {
      query = query.where('userType', '==', userType)
    }
    
    if (isPremium === 'true') {
      query = query.where('isPremium', '==', true)
    }
    if (isVerified === 'true') {
      query = query.where('isVerified', '==', true)
    }

    const snapshot = await query.get()
    const allProfiles = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }))

    // Filtrar apenas usuários com fotos públicas
    const profilesWithPhotos = allProfiles.filter((profile: any) => {
      // Verificar se tem photoURL (foto de perfil)
      const hasProfilePhoto = profile.photoURL && profile.photoURL !== ''
      
      // Verificar se tem fotos públicas na galeria
      const hasPublicPhotos = profile.photos && Array.isArray(profile.photos) && 
        profile.photos.some((photo: any) => !photo.isPrivate)
      
      // Verificar se tem fotos públicas no array publicPhotos
      const hasPublicPhotosArray = profile.publicPhotos && Array.isArray(profile.publicPhotos) && 
        profile.publicPhotos.length > 0
      
      return hasProfilePhoto || hasPublicPhotos || hasPublicPhotosArray
    })

    // Aplicar regras de matching
    const currentUserData = await db.collection('users').doc(currentUser.uid).get()
    if (!currentUserData.exists) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const userData = currentUserData.data()
    const userForMatching: User = {
      id: currentUser.uid,
      userType: userData?.userType || 'sugar_baby',
      gender: userData?.gender || 'female',
      lookingFor: userData?.lookingFor || 'male',
      username: userData?.username || ''
    }

    // Aplicar filtro de matching
    const visibleProfiles = filterVisibleUsers(userForMatching, profilesWithPhotos as User[])
    
    // Limitar ao número solicitado
    const profiles = visibleProfiles.slice(0, limit)

    return NextResponse.json({ 
      success: true, 
      profiles,
      total: profiles.length 
    })

  } catch (error) {
    console.error('Erro ao buscar perfis:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 