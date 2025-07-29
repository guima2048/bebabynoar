const { PrismaClient } = require('@prisma/client');

// Cliente para o banco atual (complexo)
const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Cliente para o novo banco (simplificado)
const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NEW_DATABASE_URL || process.env.DATABASE_URL
    }
  }
});

async function migrateUsers() {
  console.log('🔄 Migrando usuários...');
  
  const users = await oldPrisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      birthdate: true,
      gender: true,
      userType: true,
      lookingFor: true,
      state: true,
      city: true,
      about: true,
      photoURL: true,
      profession: true,
      education: true,
      emailVerified: true,
      emailVerifiedAt: true,
      status: true,
      isAdmin: true,
      premium: true,
      premiumExpiry: true,
      createdAt: true,
      updatedAt: true,
      lastActive: true
    }
  });
  
  console.log(`📊 Encontrados ${users.length} usuários para migrar`);
  
  for (const user of users) {
    try {
      await newPrisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email,
          username: user.username,
          password: user.password,
          birthdate: user.birthdate,
          gender: user.gender,
          userType: user.userType,
          lookingFor: user.lookingFor,
          state: user.state,
          city: user.city,
          about: user.about,
          photoURL: user.photoURL,
          profession: user.profession,
          education: user.education,
          emailVerified: user.emailVerified,
          emailVerifiedAt: user.emailVerifiedAt,
          status: user.status,
          isAdmin: user.isAdmin,
          premium: user.premium,
          premiumExpiry: user.premiumExpiry,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastActive: user.lastActive
        },
        create: {
          id: user.id,
          email: user.email,
          username: user.username,
          password: user.password,
          birthdate: user.birthdate,
          gender: user.gender,
          userType: user.userType,
          lookingFor: user.lookingFor,
          state: user.state,
          city: user.city,
          about: user.about,
          photoURL: user.photoURL,
          profession: user.profession,
          education: user.education,
          emailVerified: user.emailVerified,
          emailVerifiedAt: user.emailVerifiedAt,
          status: user.status,
          isAdmin: user.isAdmin,
          premium: user.premium,
          premiumExpiry: user.premiumExpiry,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastActive: user.lastActive
        }
      });
      console.log(`✅ Usuário ${user.email} migrado`);
    } catch (error) {
      console.error(`❌ Erro ao migrar usuário ${user.email}:`, error.message);
    }
  }
}

async function migratePhotos() {
  console.log('🔄 Migrando fotos...');
  
  const photos = await oldPrisma.photo.findMany();
  
  for (const photo of photos) {
    try {
      await newPrisma.photo.upsert({
        where: { id: photo.id },
        update: {
          url: photo.url,
          isPrivate: photo.isPrivate,
          uploadedAt: photo.uploadedAt,
          userId: photo.userId
        },
        create: {
          id: photo.id,
          url: photo.url,
          isPrivate: photo.isPrivate,
          uploadedAt: photo.uploadedAt,
          userId: photo.userId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar foto ${photo.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${photos.length} fotos migradas`);
}

async function migrateMessages() {
  console.log('🔄 Migrando mensagens...');
  
  const messages = await oldPrisma.message.findMany({
    select: {
      id: true,
      content: true,
      read: true,
      createdAt: true,
      senderId: true,
      receiverId: true
    }
  });
  
  for (const message of messages) {
    try {
      await newPrisma.message.upsert({
        where: { id: message.id },
        update: {
          content: message.content,
          read: message.read,
          createdAt: message.createdAt,
          senderId: message.senderId,
          receiverId: message.receiverId
        },
        create: {
          id: message.id,
          content: message.content,
          read: message.read,
          createdAt: message.createdAt,
          senderId: message.senderId,
          receiverId: message.receiverId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar mensagem ${message.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${messages.length} mensagens migradas`);
}

async function migrateInterests() {
  console.log('🔄 Migrando interesses...');
  
  const interests = await oldPrisma.interest.findMany();
  
  for (const interest of interests) {
    try {
      await newPrisma.interest.upsert({
        where: { id: interest.id },
        update: {
          message: interest.message,
          status: interest.status,
          createdAt: interest.createdAt,
          senderId: interest.senderId,
          receiverId: interest.receiverId
        },
        create: {
          id: interest.id,
          message: interest.message,
          status: interest.status,
          createdAt: interest.createdAt,
          senderId: interest.senderId,
          receiverId: interest.receiverId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar interesse ${interest.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${interests.length} interesses migrados`);
}

async function migrateNotifications() {
  console.log('🔄 Migrando notificações...');
  
  const notifications = await oldPrisma.notification.findMany({
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      read: true,
      createdAt: true,
      userId: true
    }
  });
  
  for (const notification of notifications) {
    try {
      await newPrisma.notification.upsert({
        where: { id: notification.id },
        update: {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          createdAt: notification.createdAt,
          userId: notification.userId
        },
        create: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read,
          createdAt: notification.createdAt,
          userId: notification.userId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar notificação ${notification.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${notifications.length} notificações migradas`);
}

async function migrateProfileViews() {
  console.log('🔄 Migrando visualizações de perfil...');
  
  const profileViews = await oldPrisma.profileView.findMany();
  
  for (const view of profileViews) {
    try {
      await newPrisma.profileView.upsert({
        where: { id: view.id },
        update: {
          viewedAt: view.viewedAt,
          viewerId: view.viewerId,
          viewedId: view.viewedId
        },
        create: {
          id: view.id,
          viewedAt: view.viewedAt,
          viewerId: view.viewerId,
          viewedId: view.viewedId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar visualização ${view.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${profileViews.length} visualizações migradas`);
}

async function migrateBlocks() {
  console.log('🔄 Migrando bloqueios...');
  
  const blocks = await oldPrisma.block.findMany({
    select: {
      id: true,
      reason: true,
      createdAt: true,
      userId: true,
      targetUserId: true
    }
  });
  
  for (const block of blocks) {
    try {
      await newPrisma.block.upsert({
        where: { id: block.id },
        update: {
          reason: block.reason,
          createdAt: block.createdAt,
          userId: block.userId,
          targetUserId: block.targetUserId
        },
        create: {
          id: block.id,
          reason: block.reason,
          createdAt: block.createdAt,
          userId: block.userId,
          targetUserId: block.targetUserId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar bloqueio ${block.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${blocks.length} bloqueios migrados`);
}

async function migrateFavorites() {
  console.log('🔄 Migrando favoritos...');
  
  const favorites = await oldPrisma.favorite.findMany();
  
  for (const favorite of favorites) {
    try {
      await newPrisma.favorite.upsert({
        where: { id: favorite.id },
        update: {
          createdAt: favorite.createdAt,
          userId: favorite.userId,
          targetUserId: favorite.targetUserId
        },
        create: {
          id: favorite.id,
          createdAt: favorite.createdAt,
          userId: favorite.userId,
          targetUserId: favorite.targetUserId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar favorito ${favorite.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${favorites.length} favoritos migrados`);
}

async function migrateReports() {
  console.log('🔄 Migrando denúncias...');
  
  const reports = await oldPrisma.report.findMany({
    select: {
      id: true,
      reason: true,
      description: true,
      status: true,
      createdAt: true,
      reporterId: true,
      reportedId: true
    }
  });
  
  for (const report of reports) {
    try {
      await newPrisma.report.upsert({
        where: { id: report.id },
        update: {
          reason: report.reason,
          description: report.description,
          status: report.status,
          createdAt: report.createdAt,
          reporterId: report.reporterId,
          reportedId: report.reportedId
        },
        create: {
          id: report.id,
          reason: report.reason,
          description: report.description,
          status: report.status,
          createdAt: report.createdAt,
          reporterId: report.reporterId,
          reportedId: report.reportedId
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao migrar denúncia ${report.id}:`, error.message);
    }
  }
  
  console.log(`✅ ${reports.length} denúncias migradas`);
}

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração para banco simplificado...');
    
    await migrateUsers();
    await migratePhotos();
    await migrateMessages();
    await migrateInterests();
    await migrateNotifications();
    await migrateProfileViews();
    await migrateBlocks();
    await migrateFavorites();
    await migrateReports();
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
  }
}

// Executar migração
runMigration(); 