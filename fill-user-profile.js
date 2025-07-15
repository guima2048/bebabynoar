const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fillUserProfile() {
  console.log('🔧 Preenchendo perfil do usuário sugar_daddy1@example.com...');
  
  try {
    // Dados completos para o usuário
    const userData = {
      username: 'sugar_daddy1',
      name: 'Carlos Santos',
      birthdate: new Date('1985-05-15'), // 39 anos
      gender: 'MALE',
      userType: 'SUGAR_DADDY',
      lookingFor: 'SUGAR_BABY',
      state: 'São Paulo',
      city: 'São Paulo',
      location: 'São Paulo, SP',
      about: 'Executivo bem-sucedido procurando por uma companhia agradável e discreta. Gosto de viajar, boa gastronomia e momentos especiais. Busco uma relação madura e respeitosa.',
      lookingFor: 'SUGAR_BABY',
      relationshipType: 'Presencial',
      height: '1.78m',
      weight: '80kg',
      hasChildren: true,
      smokes: false,
      drinks: true,
      education: 'Superior Completo',
      profession: 'Executivo',
      availableForTravel: true,
      receiveTravelers: true,
      social: {
        instagram: '@carlos_santos',
        linkedin: 'carlos-santos-executivo'
      },
      verified: true,
      premium: true,
      premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      status: 'ACTIVE',
      lastActive: new Date(),
      emailVerified: true,
      emailVerifiedAt: new Date()
    };

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { email: 'sugar_daddy1@example.com' },
      data: userData
    });

    console.log('✅ Usuário atualizado com sucesso!');
    console.log('📊 Dados do usuário:', {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      name: updatedUser.name,
      userType: updatedUser.userType,
      gender: updatedUser.gender,
      city: updatedUser.city,
      state: updatedUser.state,
      about: updatedUser.about?.substring(0, 50) + '...',
      verified: updatedUser.verified,
      premium: updatedUser.premium,
      createdAt: updatedUser.createdAt
    });

    // Verificar se o usuário agora tem todos os campos necessários
    const completeUser = await prisma.user.findUnique({
      where: { email: 'sugar_daddy1@example.com' },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        birthdate: true,
        gender: true,
        userType: true,
        lookingFor: true,
        state: true,
        city: true,
        location: true,
        about: true,
        photoURL: true,
        verified: true,
        premium: true,
        premiumExpiry: true,
        status: true,
        height: true,
        weight: true,
        education: true,
        profession: true,
        hasChildren: true,
        smokes: true,
        drinks: true,
        relationshipType: true,
        availableForTravel: true,
        receiveTravelers: true,
        social: true,
        createdAt: true,
        updatedAt: true,
        lastActive: true,
        isAdmin: true,
        photos: {
          select: {
            id: true,
            url: true,
            fileName: true,
            isPrivate: true,
            uploadedAt: true,
          }
        }
      }
    });

    console.log('\n🔍 Verificação final do perfil:');
    console.log('- ID:', completeUser.id);
    console.log('- Email:', completeUser.email);
    console.log('- Username:', completeUser.username);
    console.log('- Nome:', completeUser.name);
    console.log('- Idade:', Math.floor((new Date() - new Date(completeUser.birthdate)) / (365.25 * 24 * 60 * 60 * 1000)), 'anos');
    console.log('- Gênero:', completeUser.gender);
    console.log('- Tipo:', completeUser.userType);
    console.log('- Cidade:', completeUser.city);
    console.log('- Estado:', completeUser.state);
    console.log('- Sobre:', completeUser.about?.substring(0, 100) + '...');
    console.log('- Verificado:', completeUser.verified);
    console.log('- Premium:', completeUser.premium);
    console.log('- Fotos:', completeUser.photos?.length || 0);
    console.log('- Status:', completeUser.status);

    console.log('\n🎉 Perfil preenchido com sucesso! Agora você pode testar o login com:');
    console.log('Email: sugar_daddy1@example.com');
    console.log('Senha: (a senha que você definiu)');

  } catch (error) {
    console.error('❌ Erro ao preencher perfil:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillUserProfile(); 