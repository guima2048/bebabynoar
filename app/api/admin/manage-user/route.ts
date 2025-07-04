import { NextRequest, NextResponse } from 'next/server'
import { getAdminFirestore, getAdminStorage } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'

export async function PUT(req: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { userId, action, adminNotes, fields, photoId, isPrivate } = await req.json()
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (action === 'block') {
      await userRef.update({
        ativo: false,
        bloqueadoEm: new Date(),
        motivoBloqueio: adminNotes || 'Ação administrativa',
      })
    } else if (action === 'unblock') {
      await userRef.update({
        ativo: true,
        bloqueadoEm: null,
        motivoBloqueio: null,
      })
    } else if (action === 'activate_premium') {
      // Recebe quantidade de dias do frontend
      const body = await req.json();
      const dias = body.days ? parseInt(body.days, 10) : 30;
      const expiry = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
      await userRef.update({
        premium: true,
        isPremium: true,
        premiumAtivadoEm: new Date(),
        premiumAtivadoPor: 'Admin',
        premiumExpiry: expiry,
      })
    } else if (action === 'deactivate_premium') {
      await userRef.update({
        premium: false,
        isPremium: false,
        premiumDesativadoEm: new Date(),
        premiumDesativadoPor: 'Admin',
        premiumExpiry: null,
      })
    } else if (action === 'update_fields') {
      // Atualizar campos editáveis do usuário
      if (!fields || typeof fields !== 'object') {
        return NextResponse.json({ error: 'Campos para atualização não fornecidos' }, { status: 400 })
      }
      await userRef.update(fields)
    } else if (action === 'remove_photo') {
      // Remover foto do array de fotos
      if (!photoId) {
        return NextResponse.json({ error: 'ID da foto não fornecido' }, { status: 400 })
      }
      const userData = userSnap.data();
      if (!userData) {
        return NextResponse.json({ error: 'Dados do usuário não encontrados' }, { status: 404 })
      }
      const newPhotos = (userData.photos || []).filter((p: any) => p.id !== photoId);
      // Se a foto removida era a foto de perfil, definir a próxima (qualquer uma) como photoURL, ou limpar
      let newPhotoURL = userData.photoURL;
      const removedPhoto = (userData.photos || []).find((p: any) => p.id === photoId);
      if (removedPhoto && removedPhoto.url === userData.photoURL) {
        if (newPhotos.length > 0) {
          newPhotoURL = newPhotos[newPhotos.length - 1].url;
        } else {
          newPhotoURL = null;
        }
      }
      await userRef.update({ photos: newPhotos, photoURL: newPhotoURL });
    } else if (action === 'toggle_photo_status') {
      // Alternar status pública/privada da foto
      if (!photoId || typeof isPrivate === 'undefined') {
        return NextResponse.json({ error: 'Dados da foto não fornecidos' }, { status: 400 })
      }
      const userData = userSnap.data();
      if (!userData) {
        return NextResponse.json({ error: 'Dados do usuário não encontrados' }, { status: 404 })
      }
      const newPhotos = (userData.photos || []).map((p: any) =>
        p.id === photoId ? { ...p, isPrivate } : p
      );
      await userRef.update({ photos: newPhotos });
    } else if (action === 'toggle_profile_photo_visibility') {
      // Alternar visibilidade da foto de perfil
      const { photoIsPrivate } = await req.json();
      await userRef.update({ photoIsPrivate });
    } else if (action === 'remove_profile_photo') {
      // Remover foto de perfil
      await userRef.update({ 
        photoURL: null,
        photoIsPrivate: false
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Ação realizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao gerenciar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { userId, adminNotes } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Marca o usuário como deletado (não remove fisicamente por segurança)
    await userRef.update({
      deletado: true,
      deletadoEm: new Date(),
      motivoDelecao: adminNotes || 'Ação administrativa',
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário marcado como deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const db = getAdminFirestore();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    // Buscar dados do usuário
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    const userData = userSnap.data();
    if (!userData) {
      return NextResponse.json({ error: 'Dados do usuário não encontrados' }, { status: 404 });
    }

    // Buscar últimas 10 entradas de login
    const loginsSnap = await db.collection('userLogins')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    const logins = loginsSnap.docs.map(doc => doc.data());

    // Buscar conversas (últimas 10)
    const convSnap = await db.collection('conversations')
      .where('participants', 'array-contains', userId)
      .orderBy('lastMessageAt', 'desc')
      .limit(10)
      .get();
    const conversations = convSnap.docs.map(doc => {
      const data = doc.data();
      // Descobrir com quem é a conversa
      const withUser = (data.participants || []).find((id: string) => id !== userId) || 'Outro usuário';
      return {
        id: doc.id,
        withUser,
        lastMessage: data.lastMessage || '',
        lastMessageAt: data.lastMessageAt ? data.lastMessageAt.toDate?.() || data.lastMessageAt : null,
      };
    });

    // Fotos e textos do perfil
    const fotos = userData.photos || [];
    const about = userData.about || '';
    const lookingFor = userData.lookingFor || '';

    return NextResponse.json({
      user: {
        id: userId,
        username: userData.username || '',
        name: userData.name || userData.displayName || 'Usuário',
        email: userData.email || '',
        userType: userData.userType || '',
        city: userData.city || '',
        state: userData.state || '',
        ativo: userData.ativo !== undefined ? userData.ativo : true,
        premium: userData.premium || userData.isPremium || false,
        createdAt: userData.createdAt?.toDate?.() || userData.createdAt || '',
        photos: fotos,
        about,
        lookingFor,
        premiumExpiry: userData.premiumExpiry?.toDate?.() || userData.premiumExpiry || null,
        premiumDaysLeft: userData.premiumExpiry ? Math.max(0, Math.ceil((userData.premiumExpiry.toDate ? userData.premiumExpiry.toDate().getTime() : new Date(userData.premiumExpiry).getTime()) - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
        signupIp: userData.signupIp || '',
        lastLoginIp: userData.lastLoginIp || '',
        lastLoginIpLocation: userData.lastLoginIpLocation || '',
        lastLoginAt: userData.lastLoginAt?.toDate?.() || userData.lastLoginAt || null,
        // Adicionar campos da foto de perfil
        photoURL: userData.photoURL || null,
        photoIsPrivate: userData.photoIsPrivate || false,
        // Adicionar campos de estilo de vida
        height: userData.height || '',
        weight: userData.weight || '',
        education: userData.education || '',
        hasChildren: userData.hasChildren || '',
        smokes: userData.smokes || '',
        drinks: userData.drinks || '',
        // Adicionar campos de relacionamento sugar
        relationshipType: userData.relationshipType || '',
        availableForTravel: userData.availableForTravel || '',
        receiveTravelers: userData.receiveTravelers || '',
        // Outros campos
        birthdate: userData.birthdate || '',
        verified: userData.verified || false,
        social: userData.social || {},
      },
      logins,
      conversations,
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const isPrivate = formData.get('isPrivate') === 'true';
    const type = formData.get('type') as string; // 'profile' ou 'gallery'

    if (!file || !userId) {
      return NextResponse.json({ error: 'Arquivo ou ID do usuário não fornecido' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Upload para Firebase Storage
    const storage = getAdminStorage();
    const fileName = type === 'profile' 
      ? `users/${userId}/profile/${Date.now()}_${file.name}`
      : `users/${userId}/photos/${Date.now()}_${file.name}`;
    const fileRef = storage.file(fileName);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    const photoURL = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2500',
    });

    if (type === 'profile') {
      // Atualizar foto de perfil
      await userRef.update({ 
        photoURL: photoURL[0],
        photoIsPrivate: isPrivate || false
      });

      return NextResponse.json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso',
        photoURL: photoURL[0],
      });
    } else {
      // Adicionar foto ao array de fotos do usuário
      const userData = userSnap.data();
      const photos = userData?.photos || [];
      const newPhoto = {
        id: `photo_${Date.now()}`,
        url: photoURL[0],
        photoURL: photoURL[0],
        isPrivate,
        uploadedAt: new Date(),
      };
      photos.push(newPhoto);

      console.log('📸 [Admin API] Salvando foto:', newPhoto)
      console.log('📸 [Admin API] Array de fotos atualizado:', photos)

      // Sempre atualizar photoURL para a última foto adicionada
      await userRef.update({ photos, photoURL: photoURL[0] });

      console.log('📸 [Admin API] Foto salva com sucesso no Firestore')

      return NextResponse.json({
        success: true,
        message: 'Foto adicionada com sucesso',
        photo: newPhoto,
      });
    }

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 