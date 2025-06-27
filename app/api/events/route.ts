import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, setDoc } from 'firebase/firestore'

// Interfaces TypeScript
interface EventData {
  id: string
  title: string
  description: string
  date: any // Firestore Timestamp
  location: string
  category: string
  organizerId: string
  maxParticipants?: number
  participants?: string[]
  isPremium: boolean
  status: string
  createdAt: any
  updatedAt?: any
}

interface UserData {
  name?: string
  displayName?: string
  userType: string
  isPremium?: boolean
  photos?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, date, location, category, organizerId, maxParticipants, isPremium } = await request.json()

    if (!title || !description || !date || !location || !category || !organizerId) {
      return NextResponse.json({ error: 'Todos os campos obrigatórios devem ser preenchidos' }, { status: 400 })
    }

    // Verificar se o organizador existe
    const organizerRef = doc(db, 'users', organizerId)
    const organizerDoc = await getDoc(organizerRef)
    if (!organizerDoc.exists()) {
      return NextResponse.json({ error: 'Organizador não encontrado' }, { status: 404 })
    }

    // Criar evento
    const eventRef = doc(collection(db, 'events'))
    await setDoc(eventRef, {
      title,
      description,
      date: new Date(date),
      location,
      category,
      organizerId,
      maxParticipants: maxParticipants || null,
      participants: [],
      isPremium: isPremium || false,
      status: 'active',
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: 'Evento criado com sucesso',
      eventId: eventRef.id
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
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const date = searchParams.get('date')
    const organizerId = searchParams.get('organizerId')
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Buscar eventos
    const eventsRef = collection(db, 'events')
    let q = query(
      eventsRef,
      where('status', '==', 'active'),
      orderBy('date', 'asc')
    )

    // Aplicar filtros
    if (category) {
      q = query(q, where('category', '==', category))
    }
    if (location) {
      q = query(q, where('location', '==', location))
    }
    if (organizerId) {
      q = query(q, where('organizerId', '==', organizerId))
    }

    const querySnapshot = await getDocs(q)
    let events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventData[]

    // Filtrar por data se especificado
    if (date) {
      const targetDate = new Date(date)
      events = events.filter(event => {
        const eventDate = event.date?.toDate ? event.date.toDate() : new Date(event.date)
        return eventDate.toDateString() === targetDate.toDateString()
      })
    }

    // Filtrar eventos que o usuário pode participar
    if (userId) {
      const userRef = doc(db, 'users', userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        events = events.filter(event => {
          // Usuários não premium só podem ver eventos gratuitos
          if (!userData.isPremium && event.isPremium) {
            return false
          }
          return true
        })
      }
    }

    // Aplicar paginação
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedEvents = events.slice(startIndex, endIndex)

    // Buscar dados dos organizadores
    const eventsWithOrganizers = await Promise.all(
      paginatedEvents.map(async (event) => {
        const organizerRef = doc(db, 'users', event.organizerId)
        const organizerDoc = await getDoc(organizerRef)
        
        if (organizerDoc.exists()) {
          const organizerData = organizerDoc.data() as UserData
          return {
            ...event,
            organizer: {
              id: organizerDoc.id,
              name: organizerData.name || organizerData.displayName || 'Organizador',
              userType: organizerData.userType,
              isPremium: organizerData.isPremium || false,
              photos: organizerData.photos || [],
            }
          }
        }
        return event
      })
    )

    return NextResponse.json({
      events: eventsWithOrganizers,
      pagination: {
        page,
        limit,
        total: events.length,
        totalPages: Math.ceil(events.length / limit),
      },
      filters: {
        category,
        location,
        date,
        organizerId,
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { eventId, action, userId } = await request.json()

    if (!eventId || !action || !userId) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    }

    // Buscar evento
    const eventRef = doc(db, 'events', eventId)
    const eventDoc = await getDoc(eventRef)
    
    if (!eventDoc.exists()) {
      return NextResponse.json({ error: 'Evento não encontrado' }, { status: 404 })
    }

    const eventData = eventDoc.data() as EventData

    switch (action) {
      case 'join':
        // Verificar se o usuário já está participando
        if (eventData.participants?.includes(userId)) {
          return NextResponse.json({ error: 'Você já está participando deste evento' }, { status: 400 })
        }

        // Verificar limite de participantes
        if (eventData.maxParticipants && eventData.participants && eventData.participants.length >= eventData.maxParticipants) {
          return NextResponse.json({ error: 'Evento lotado' }, { status: 400 })
        }

        // Adicionar participante
        await updateDoc(eventRef, {
          participants: [...(eventData.participants || []), userId],
          updatedAt: new Date(),
        })
        break

      case 'leave':
        // Remover participante
        const updatedParticipants = eventData.participants?.filter(id => id !== userId) || []
        await updateDoc(eventRef, {
          participants: updatedParticipants,
          updatedAt: new Date(),
        })
        break

      case 'cancel':
        // Verificar se é o organizador
        if (eventData.organizerId !== userId) {
          return NextResponse.json({ error: 'Apenas o organizador pode cancelar o evento' }, { status: 403 })
        }

        await updateDoc(eventRef, {
          status: 'cancelled',
          updatedAt: new Date(),
        })
        break

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Evento ${action === 'join' ? 'participado' : action === 'leave' ? 'abandonado' : 'cancelado'} com sucesso` 
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 