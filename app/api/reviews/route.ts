import { NextRequest, NextResponse } from 'next/server'
import { db, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, getDoc, deleteDoc } from '@/lib/firebase'
import { orderBy, limit, setDoc } from 'firebase/firestore'

interface Review {
  id: string
  userId: string
  targetUserId: string
  rating: number
  comment: string
  category: string
  createdAt: any
  userType: string
  targetUserType: string
}

interface ReviewWithUser extends Review {
  reviewer: {
    id: string
    name: string
    userType: string
    isPremium: boolean
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { userId, targetUserId, rating, comment, category } = await req.json()

    if (!userId || !targetUserId || !rating || !category) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Não é possível avaliar a si mesmo' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5' },
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

    // Verificar se já avaliou este usuário nesta categoria
    const reviewRef = doc(db, 'reviews', `${userId}_${targetUserId}_${category}`)
    const reviewDoc = await getDoc(reviewRef)
    
    if (reviewDoc.exists()) {
      return NextResponse.json(
        { error: 'Você já avaliou este usuário nesta categoria' },
        { status: 400 }
      )
    }

    // Criar avaliação
    await setDoc(reviewRef, {
      userId,
      targetUserId,
      rating,
      comment: comment || '',
      category,
      createdAt: new Date(),
      userType: userDoc.data().userType,
      targetUserType: targetDoc.data().userType,
    })

    // Atualizar estatísticas do usuário avaliado
    const targetData = targetDoc.data()
    const currentReviews = targetData.reviews || {}
    const categoryReviews = currentReviews[category] || { count: 0, total: 0 }
    
    categoryReviews.count += 1
    categoryReviews.total += rating
    categoryReviews.average = categoryReviews.total / categoryReviews.count

    await updateDoc(targetRef, {
      reviews: {
        ...currentReviews,
        [category]: categoryReviews,
      },
      lastReviewAt: new Date(),
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Avaliação enviada com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao criar avaliação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url)
    const targetUserId = searchParams.get('targetUserId')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'ID do usuário alvo é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar avaliações
    const reviewsRef = collection(db, 'reviews')
    let q = query(
      reviewsRef,
      where('targetUserId', '==', targetUserId),
      orderBy('createdAt', 'desc')
    )

    if (category) {
      q = query(
        reviewsRef,
        where('targetUserId', '==', targetUserId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
    }

    const querySnapshot = await getDocs(q)
    const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[]

    // Buscar dados dos usuários que fizeram as avaliações
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        if (!db) { return null; }
        const userRef = doc(db, 'users', review.userId)
        const userDoc = await getDoc(userRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          return {
            ...review,
            reviewer: {
              id: userDoc.id,
              name: userData.name || userData.displayName || 'Usuário',
              userType: userData.userType,
              isPremium: userData.isPremium || false,
            }
          } as ReviewWithUser
        }
        return null
      })
    )

    // Filtrar avaliações válidas e aplicar paginação
    const validReviews = reviewsWithUsers.filter((review): review is ReviewWithUser => review !== null)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedReviews = validReviews.slice(startIndex, endIndex)

    // Calcular estatísticas
    const stats = {
      total: validReviews.length,
      average: validReviews.length > 0 
        ? validReviews.reduce((sum, review) => sum + review.rating, 0) / validReviews.length 
        : 0,
      byRating: {
        1: validReviews.filter(r => r.rating === 1).length,
        2: validReviews.filter(r => r.rating === 2).length,
        3: validReviews.filter(r => r.rating === 3).length,
        4: validReviews.filter(r => r.rating === 4).length,
        5: validReviews.filter(r => r.rating === 5).length,
      },
      byCategory: validReviews.reduce((acc, review) => {
        acc[review.category] = (acc[review.category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({
      reviews: paginatedReviews,
      stats,
      pagination: {
        page,
        limit,
        total: validReviews.length,
        totalPages: Math.ceil(validReviews.length / limit),
      }
    })

  } catch (error) {
    console.error('Erro ao buscar avaliações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { reviewId, rating, comment } = await req.json()

    if (!reviewId || !rating) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    // Buscar avaliação existente
    const reviewRef = doc(db, 'reviews', reviewId)
    const reviewDoc = await getDoc(reviewRef)
    
    if (!reviewDoc.exists()) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    const reviewData = reviewDoc.data() as Review
    const oldRating = reviewData.rating

    // Atualizar avaliação
    await updateDoc(reviewRef, {
      rating,
      comment: comment || '',
      updatedAt: new Date(),
    })

    // Atualizar estatísticas do usuário avaliado
    const targetRef = doc(db, 'users', reviewData.targetUserId)
    const targetDoc = await getDoc(targetRef)
    
    if (targetDoc.exists()) {
      const targetData = targetDoc.data()
      const currentReviews = targetData.reviews || {}
      const categoryReviews = currentReviews[reviewData.category] || { count: 0, total: 0 }
      
      // Remover rating antigo e adicionar novo
      categoryReviews.total = categoryReviews.total - oldRating + rating
      categoryReviews.average = categoryReviews.total / categoryReviews.count

      await updateDoc(targetRef, {
        reviews: {
          ...currentReviews,
          [reviewData.category]: categoryReviews,
        },
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Avaliação atualizada com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 });
    }
    const { reviewId } = await req.json()

    if (!reviewId) {
      return NextResponse.json(
        { error: 'ID da avaliação é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar avaliação existente
    const reviewRef = doc(db, 'reviews', reviewId)
    const reviewDoc = await getDoc(reviewRef)
    
    if (!reviewDoc.exists()) {
      return NextResponse.json(
        { error: 'Avaliação não encontrada' },
        { status: 404 }
      )
    }

    // Buscar dados da avaliação
    const reviewData = reviewDoc.data() as Review

    // Atualizar estatísticas do usuário avaliado
    const targetRef = doc(db, 'users', reviewData.targetUserId)
    const targetDoc = await getDoc(targetRef)
    
    if (targetDoc.exists()) {
      const targetData = targetDoc.data()
      const currentReviews = targetData.reviews || {}
      const categoryReviews = currentReviews[reviewData.category] || { count: 0, total: 0 }
      
      // Remover rating da avaliação
      categoryReviews.total -= reviewData.rating
      categoryReviews.count -= 1
      categoryReviews.average = categoryReviews.total / categoryReviews.count

      await updateDoc(targetRef, {
        reviews: {
          ...currentReviews,
          [reviewData.category]: categoryReviews,
        },
      })
    }

    // Remover avaliação
    await deleteDoc(reviewRef)

    return NextResponse.json({ 
      success: true, 
      message: 'Avaliação removida com sucesso' 
    })

  } catch (error) {
    console.error('Erro ao remover avaliação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 