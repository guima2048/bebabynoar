export interface MockProfile {
  id: string
  username: string
  birthdate: string
  city: string
  state: string
  userType: string
  gender?: string
  lookingFor?: string
  photoURL?: string
  about?: string
  isPremium?: boolean
  emailVerified?: boolean
  photos?: Array<{
    url: string
    isPrivate: boolean
  }>
  publicPhotos?: string[]
}

export const mockProfiles: MockProfile[] = [
  // Sugar Babies
  {
    id: 'sb1',
    username: 'Ana Beatriz',
    birthdate: '1998-05-15',
    city: 'São Paulo',
    state: 'SP',
    userType: 'sugar_baby',
    gender: 'female',
    lookingFor: 'male',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    about: 'Adoro viajar e conhecer lugares novos. Busco alguém especial para compartilhar momentos únicos.',
    isPremium: true,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', isPrivate: true }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
    ]
  },
  {
    id: 'sb2',
    username: 'Camila Silva',
    birthdate: '1995-08-22',
    city: 'Rio de Janeiro',
    state: 'RJ',
    userType: 'sugar_baby',
    gender: 'female',
    lookingFor: 'male',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    about: 'Estudante de medicina, apaixonada por arte e cultura. Procuro conexões genuínas.',
    isPremium: false,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
    ]
  },
  {
    id: 'sb3',
    username: 'Juliana Costa',
    birthdate: '1997-03-10',
    city: 'Belo Horizonte',
    state: 'MG',
    userType: 'sugar_baby',
    gender: 'female',
    lookingFor: 'both',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    about: 'Modelo e influencer. Amo moda, viagens e experiências únicas.',
    isPremium: true,
    emailVerified: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    ]
  },

  // Sugar Daddies
  {
    id: 'sd1',
    username: 'Roberto Santos',
    birthdate: '1975-12-08',
    city: 'São Paulo',
    state: 'SP',
    userType: 'sugar_daddy',
    gender: 'male',
    lookingFor: 'female',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    about: 'Empresário bem-sucedido, adoro viajar e conhecer pessoas interessantes.',
    isPremium: true,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    ]
  },
  {
    id: 'sd2',
    username: 'Carlos Mendes',
    birthdate: '1980-06-15',
    city: 'Rio de Janeiro',
    state: 'RJ',
    userType: 'sugar_daddy',
    gender: 'male',
    lookingFor: 'both',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    about: 'Executivo de multinacional, apaixonado por esportes e boa companhia.',
    isPremium: false,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    ]
  },

  // Sugar Mommies
  {
    id: 'sm1',
    username: 'Patrícia Lima',
    birthdate: '1978-09-20',
    city: 'São Paulo',
    state: 'SP',
    userType: 'sugar_mommy',
    gender: 'female',
    lookingFor: 'male',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    about: 'Médica cardiologista, independente e bem-sucedida. Busco companhia masculina.',
    isPremium: true,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face'
    ]
  },
  {
    id: 'sm2',
    username: 'Fernanda Costa',
    birthdate: '1982-04-12',
    city: 'Brasília',
    state: 'DF',
    userType: 'sugar_mommy',
    gender: 'female',
    lookingFor: 'male',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    about: 'Advogada especializada em direito empresarial. Gosto de homens jovens e ambiciosos.',
    isPremium: false,
    emailVerified: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face'
    ]
  },

  // Sugar Babyboys
  {
    id: 'sbb1',
    username: 'Lucas Oliveira',
    birthdate: '1999-11-25',
    city: 'São Paulo',
    state: 'SP',
    userType: 'sugar_babyboy',
    gender: 'male',
    lookingFor: 'female',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    about: 'Estudante de engenharia, atleta e muito sociável. Procuro uma sugar mommy especial.',
    isPremium: true,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', isPrivate: false },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    ]
  },
  {
    id: 'sbb2',
    username: 'Gabriel Santos',
    birthdate: '1996-07-18',
    city: 'Rio de Janeiro',
    state: 'RJ',
    userType: 'sugar_babyboy',
    gender: 'male',
    lookingFor: 'female',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    about: 'Modelo e personal trainer. Busco uma mulher madura e bem-sucedida.',
    isPremium: false,
    emailVerified: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
    ]
  },

  // Mais perfis para variedade
  {
    id: 'sb4',
    username: 'Mariana Alves',
    birthdate: '1994-01-30',
    city: 'Curitiba',
    state: 'PR',
    userType: 'sugar_baby',
    gender: 'female',
    lookingFor: 'male',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    about: 'Designer gráfica criativa, adoro arte e cultura. Procuro alguém para compartilhar experiências.',
    isPremium: true,
    emailVerified: true,
    photos: [
      { url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
    ]
  },
  {
    id: 'sd3',
    username: 'Ricardo Ferreira',
    birthdate: '1972-03-05',
    city: 'Porto Alegre',
    state: 'RS',
    userType: 'sugar_daddy',
    gender: 'male',
    lookingFor: 'female',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    about: 'Empresário do setor de tecnologia, apaixonado por inovação e mulheres jovens.',
    isPremium: true,
    emailVerified: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    ]
  }
]

export interface MockConversation {
  id: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  user: {
    id: string
    username: string
    photoURL?: string
    userType: string
    premium: boolean
    emailVerified: boolean
    online: boolean
  }
}

export const mockConversations: MockConversation[] = [
  {
    id: 'conv1',
    lastMessage: 'Oi! Como você está? 😊',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    unreadCount: 2,
    user: {
      id: 'user1',
      username: 'Maria Santos',
      photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: true,
      emailVerified: true,
      online: true
    }
  },
  {
    id: 'conv2',
    lastMessage: 'Vamos sair hoje à noite? 🍷',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    unreadCount: 0,
    user: {
      id: 'user2',
      username: 'Ana Costa',
      photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: false,
      emailVerified: true,
      online: false
    }
  },
  {
    id: 'conv3',
    lastMessage: '📷 Enviou uma imagem',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    unreadCount: 1,
    user: {
      id: 'user3',
      username: 'Juliana Lima',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: true,
      emailVerified: false,
      online: true
    }
  },
  {
    id: 'conv4',
    lastMessage: 'Obrigada pelo jantar ontem! ❤️',
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
    unreadCount: 0,
    user: {
      id: 'user4',
      username: 'Fernanda Silva',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: false,
      emailVerified: true,
      online: false
    }
  },
  {
    id: 'conv5',
    lastMessage: 'Que tal irmos ao shopping? 🛍️',
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    unreadCount: 3,
    user: {
      id: 'user5',
      username: 'Camila Oliveira',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: true,
      emailVerified: true,
      online: true
    }
  },
  {
    id: 'conv6',
    lastMessage: 'Boa noite! 😴',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
    unreadCount: 0,
    user: {
      id: 'user6',
      username: 'Patrícia Santos',
      photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: false,
      emailVerified: false,
      online: false
    }
  },
  {
    id: 'conv7',
    lastMessage: 'Vamos conversar mais? 💬',
    lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    unreadCount: 0,
    user: {
      id: 'user7',
      username: 'Roberta Almeida',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      userType: 'sugar_baby',
      premium: true,
      emailVerified: true,
      online: false
    }
  }
]

export const mockStats = {
  totalConversations: mockConversations.length,
  unreadMessages: mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0),
  onlineUsers: mockConversations.filter(conv => conv.user.online).length
}

export interface MockMessage {
  id: string
  content: string
  timestamp: Date
  senderId: string
  type: 'text' | 'image'
  imageURL?: string
  read: boolean
}

export interface MockChatUser {
  id: string
  username: string
  photoURL?: string
  userType: string
  premium: boolean
  emailVerified: boolean
  online: boolean
  lastSeen?: Date
}

export const mockUsers: Record<string, MockChatUser> = {
  'user1': {
    id: 'user1',
    username: 'Maria Santos',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    userType: 'sugar_baby',
    premium: true,
    emailVerified: true,
    online: true
  },
  'user2': {
    id: 'user2',
    username: 'Ana Costa',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    userType: 'sugar_baby',
    premium: false,
    emailVerified: true,
    online: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000)
  },
  'user3': {
    id: 'user3',
    username: 'Juliana Lima',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    userType: 'sugar_baby',
    premium: true,
    emailVerified: false,
    online: true
  },
  'user4': {
    id: 'user4',
    username: 'Fernanda Silva',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    userType: 'sugar_baby',
    premium: false,
    emailVerified: true,
    online: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  'user5': {
    id: 'user5',
    username: 'Camila Oliveira',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    userType: 'sugar_baby',
    premium: true,
    emailVerified: true,
    online: true
  }
}

export const mockMessages: Record<string, MockMessage[]> = {
  'user1': [
    {
      id: 'msg1',
      content: 'Oi! Como você está? 😊',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      senderId: 'user1',
      type: 'text',
      read: true
    },
    {
      id: 'msg2',
      content: 'Oi! Tudo bem sim, e você?',
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg3',
      content: 'Muito bem! Que tal sairmos hoje à noite? 🍷',
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      senderId: 'user1',
      type: 'text',
      read: true
    },
    {
      id: 'msg4',
      content: 'Adoraria! Que lugar você tem em mente?',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg5',
      content: 'Que tal aquele restaurante italiano no centro?',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      senderId: 'user1',
      type: 'text',
      read: false
    }
  ],
  'user2': [
    {
      id: 'msg1',
      content: 'Oi! Vi seu perfil e adorei! 💕',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      senderId: 'user2',
      type: 'text',
      read: true
    },
    {
      id: 'msg2',
      content: 'Oi! Obrigada! Seu perfil também é muito interessante 😊',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg3',
      content: 'Que tal conversarmos mais?',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      senderId: 'user2',
      type: 'text',
      read: true
    }
  ],
  'user3': [
    {
      id: 'msg1',
      content: 'Oi! Como você está?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      senderId: 'user3',
      type: 'text',
      read: true
    },
    {
      id: 'msg2',
      content: 'Oi! Tudo bem sim! E você?',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg3',
      content: 'Muito bem! Que tal irmos ao shopping? 🛍️',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      senderId: 'user3',
      type: 'text',
      read: true
    },
    {
      id: 'msg4',
      content: 'Adoraria! Que dia você tem livre?',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg5',
      content: 'Que tal amanhã?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      senderId: 'user3',
      type: 'text',
      read: false
    },
    {
      id: 'msg6',
      content: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      senderId: 'user3',
      type: 'image',
      imageURL: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      read: false
    }
  ],
  'user4': [
    {
      id: 'msg1',
      content: 'Oi! Obrigada pelo jantar ontem! ❤️',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      senderId: 'user4',
      type: 'text',
      read: true
    },
    {
      id: 'msg2',
      content: 'Foi um prazer! Você é muito especial 😊',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg3',
      content: 'Que tal repetirmos em breve?',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      senderId: 'user4',
      type: 'text',
      read: true
    }
  ],
  'user5': [
    {
      id: 'msg1',
      content: 'Oi! Vi que você gosta de viagens também! ✈️',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      senderId: 'user5',
      type: 'text',
      read: true
    },
    {
      id: 'msg2',
      content: 'Sim! Adoro conhecer lugares novos!',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg3',
      content: 'Que tal irmos juntos para a praia? 🏖️',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      senderId: 'user5',
      type: 'text',
      read: true
    },
    {
      id: 'msg4',
      content: 'Adoraria! Qual praia você tem em mente?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
      senderId: 'currentUser',
      type: 'text',
      read: true
    },
    {
      id: 'msg5',
      content: 'Que tal Búzios? É linda lá!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      senderId: 'user5',
      type: 'text',
      read: false
    }
  ]
} 