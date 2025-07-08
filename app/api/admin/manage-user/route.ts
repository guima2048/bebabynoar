import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function PUT(req: NextRequest) {
  try {
    // Autenticação admin
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { userId, action, fields, photoId, isPrivate } = await req.json()
    
    if (!userId || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    if (action === 'block') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'BANNED',
        }
      })
    } else if (action === 'unblock') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
        }
      })
    } else if (action === 'activate_premium') {
      // Recebe quantidade de dias do frontend
      const body = await req.json();
      const dias = body.days ? parseInt(body.days, 10) : 30;
      const expiry = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: userId },
        data: {
          premium: true,
          premiumExpiry: expiry,
        }
      })
    } else if (action === 'deactivate_premium') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          premium: false,
          premiumExpiry: null,
        }
      })
    } else if (action === 'update_fields') {
      // Atualizar campos editáveis do usuário
      if (!fields || typeof fields !== 'object') {
        return NextResponse.json({ error: 'Campos para atualização não fornecidos' }, { status: 400 })
      }
      await prisma.user.update({
        where: { id: userId },
        data: fields
      })
    } else if (action === 'remove_photo') {
      // Remover foto do array de fotos
      if (!photoId) {
        return NextResponse.json({ error: 'ID da foto não fornecido' }, { status: 400 })
      }
      await prisma.photo.delete({
        where: { id: photoId }
      });
    } else if (action === 'toggle_photo_status') {
      // Alternar status pública/privada da foto
      if (!photoId || typeof isPrivate === 'undefined') {
        return NextResponse.json({ error: 'Dados da foto não fornecidos' }, { status: 400 })
      }
      await prisma.photo.update({
        where: { id: photoId },
        data: { isPrivate }
      });
    } else if (action === 'remove_profile_photo') {
      // Remover foto de perfil
      await prisma.user.update({
        where: { id: userId },
        data: { 
          photoURL: null,
        }
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
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Marca o usuário como inativo (não remove fisicamente por segurança)
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'INACTIVE',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuário marcado como inativo com sucesso'
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
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        photos: true,
        loginHistory: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        conversations: {
          include: {
            conversation: {
              include: {
                participants: {
                  include: {
                    user: true
                  }
                },
                messages: {
                  orderBy: { createdAt: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Calcular dias restantes do premium
    const premiumDaysLeft = user.premiumExpiry 
      ? Math.max(0, Math.ceil((user.premiumExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username || '',
        name: user.name || 'Usuário',
        email: user.email || '',
        userType: user.userType || '',
        city: user.city || '',
        state: user.state || '',
        ativo: user.status === 'ACTIVE',
        premium: user.premium || false,
        createdAt: user.createdAt,
        photos: user.photos || [],
        about: user.about || '',
        lookingFor: user.lookingFor || '',
        premiumExpiry: user.premiumExpiry,
        premiumDaysLeft,
        photoURL: user.photoURL,
        height: user.height || '',
        weight: user.weight || '',
        education: user.education || '',
        hasChildren: user.hasChildren || '',
        smokes: user.smokes || '',
        drinks: user.drinks || '',
        relationshipType: user.relationshipType || '',
        availableForTravel: user.availableForTravel || '',
        receiveTravelers: user.receiveTravelers || '',
        birthdate: user.birthdate,
        verified: user.verified || false,
        social: user.social || {},
      },
      logins: user.loginHistory || [],
      conversations: user.conversations?.map(conv => {
        const otherParticipant = conv.conversation.participants.find(p => p.userId !== userId);
        return {
          id: conv.conversation.id,
          withUser: otherParticipant?.user.name || 'Outro usuário',
          lastMessage: conv.conversation.messages?.[0]?.content || '',
          lastMessageAt: conv.conversation.lastMessageTime,
        };
      }) || [],
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
    const cookieStore = await cookies();
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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Salvar arquivo localmente
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `public/uploads/${userId}/${type}/${fileName}`;
    
    // Criar diretório se não existir
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, buffer);
    const photoURL = `/uploads/${userId}/${type}/${fileName}`;

    if (type === 'profile') {
      // Atualizar foto de perfil
      await prisma.user.update({
        where: { id: userId },
        data: { 
          photoURL
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso',
        photoURL,
      });
    } else {
      // Adicionar foto ao array de fotos do usuário
      const newPhoto = await prisma.photo.create({
        data: {
          userId,
          url: photoURL,
          isPrivate,
          uploadedAt: new Date(),
        }
      });

      console.log('📸 [Admin API] Salvando foto:', newPhoto)

      // Sempre atualizar photoURL para a última foto adicionada
      await prisma.user.update({
        where: { id: userId },
        data: { photoURL }
      });

      console.log('📸 [Admin API] Foto salva com sucesso no banco')

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