import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'


interface Trip {
  id?: string
  userId: string
  username: string
  state: string
  city: string
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'cancelled'
  isPublic: boolean
  createdAt: any
  updatedAt: any
  description?: string
  lookingFor?: string
}

// POST - Criar nova viagem
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, username, state, city, startDate, endDate, description, lookingFor, isPublic } = body

    if (!userId || !username || !state || !city || !startDate || !endDate) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }

    const tripData: Omit<Trip, 'id'> = {
      userId,
      username,
      state,
      city,
      startDate,
      endDate,
      status: 'active',
      isPublic: isPublic !== undefined ? isPublic : true,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: description || '',
      lookingFor: lookingFor || ''
    }

    const docRef = await db.collection('trips').add(tripData)
    
    return NextResponse.json({ 
      success: true, 
      tripId: docRef.id,
      message: 'Viagem agendada com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao criar viagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Listar viagens do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const viewerId = searchParams.get('viewerId') // ID do usuário que está visualizando

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }

    // Se o viewerId for diferente do userId, mostrar apenas viagens públicas
    const isOwnProfile = viewerId === userId

    let tripsQuery
    if (isOwnProfile) {
      // Próprio perfil: mostrar todas as viagens
      tripsQuery = db.collection('trips')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
    } else {
      // Perfil de outro usuário: mostrar apenas viagens públicas
      tripsQuery = db.collection('trips')
        .where('userId', '==', userId)
        .where('isPublic', '==', true)
        .orderBy('createdAt', 'desc')
    }

    const querySnapshot = await tripsQuery.get()
    const trips: Trip[] = []

    querySnapshot.forEach((doc) => {
      trips.push({
        id: doc.id,
        ...doc.data()
      } as Trip)
    })

    return NextResponse.json({ trips })

  } catch (error) {
    console.error('Erro ao buscar viagens:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar viagem
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tripId, status, description, lookingFor, isPublic } = body

    if (!tripId) {
      return NextResponse.json({ error: 'ID da viagem não fornecido' }, { status: 400 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }

    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) updateData.status = status
    if (description !== undefined) updateData.description = description
    if (lookingFor !== undefined) updateData.lookingFor = lookingFor
    if (isPublic !== undefined) updateData.isPublic = isPublic

    await db.collection('trips').doc(tripId).update(updateData)

    return NextResponse.json({ 
      success: true, 
      message: 'Viagem atualizada com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao atualizar viagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar viagem
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json({ error: 'ID da viagem não fornecido' }, { status: 400 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Erro de configuração do banco de dados' }, { status: 500 })
    }

    await db.collection('trips').doc(tripId).delete()

    return NextResponse.json({ 
      success: true, 
      message: 'Viagem removida com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao deletar viagem:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 