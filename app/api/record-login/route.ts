import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    // Obter IP do cliente com múltiplos headers
    const forwarded = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = req.headers.get('x-client-ip')
    const cfConnectingIp = req.headers.get('cf-connecting-ip')
    const trueClientIp = req.headers.get('true-client-ip')
    
    let detectedIp = forwarded?.split(',')[0] || 
                    realIp || 
                    clientIp || 
                    cfConnectingIp || 
                    trueClientIp || 
                    req.ip || 
                    'unknown'
    
    // Limpar IP se necessário
    detectedIp = detectedIp.trim()
    
    console.log('🔍 IP detectado:', detectedIp)
    console.log('🔍 Headers:', {
      'x-forwarded-for': req.headers.get('x-forwarded-for'),
      'x-real-ip': req.headers.get('x-real-ip'),
      'x-client-ip': req.headers.get('x-client-ip'),
      'cf-connecting-ip': req.headers.get('cf-connecting-ip'),
      'true-client-ip': req.headers.get('true-client-ip')
    })

    // Obter localização do IP
    let ipLocation = 'Desconhecida'
    try {
      if (detectedIp && detectedIp !== 'unknown') {
        const locationResponse = await fetch(`https://ipapi.co/${detectedIp}/json/`)
        if (locationResponse.ok) {
          const locationData = await locationResponse.json()
          ipLocation = `${locationData.city || ''}, ${locationData.region || ''}, ${locationData.country_name || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ',')
          console.log('📍 Localização obtida:', ipLocation)
        }
      }
    } catch (error) {
      console.error('Erro ao obter localização do IP:', error)
    }

    const db = getAdminFirestore()
    
    // Registrar login
    await db.collection('userLogins').add({
      userId,
      ip: detectedIp,
      ipLocation,
      timestamp: new Date(),
      userAgent: req.headers.get('user-agent') || 'unknown'
    })

    // Atualizar último IP no documento do usuário
    await db.collection('users').doc(userId).update({
      lastLoginIp: detectedIp,
      lastLoginIpLocation: ipLocation,
      lastLoginAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Login registrado com sucesso',
      ip: detectedIp,
      ipLocation
    })

  } catch (error) {
    console.error('Erro ao registrar login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 