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
  isVerified?: boolean
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
    isVerified: true,
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
    isVerified: true,
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
    lookingFor: 'male',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    about: 'Modelo e influencer. Amo moda, viagens e experiências únicas.',
    isPremium: true,
    isVerified: false,
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
    isVerified: true,
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
    lookingFor: 'female',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    about: 'Executivo de multinacional, apaixonado por esportes e boa companhia.',
    isPremium: false,
    isVerified: true,
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
    isVerified: true,
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
    isVerified: false,
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
    isVerified: true,
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
    isVerified: false,
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
    isVerified: true,
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
    isVerified: false,
    photos: [
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', isPrivate: false }
    ],
    publicPhotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
    ]
  }
] 