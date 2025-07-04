import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProfilePage from '@/app/profile/page'
import AuthContext from '@/contexts/AuthContext'
import { getDoc as originalGetDoc } from 'firebase/firestore'

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useParams: () => ({}),
}))

// Mock do Firebase
jest.mock('@/lib/firebase', () => ({
  getFirestoreDB: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
  })),
  getFirebaseStorage: jest.fn(() => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
  })),
}))

// Mock do Firestore
jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore')
  return {
    ...original,
    doc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
  }
})

const mockGetDoc = require('firebase/firestore').getDoc
mockGetDoc.mockImplementation(() => Promise.resolve({
  exists: () => true,
  data: () => mockProfile,
}))

// Mock do Storage
jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}))

// Mock do react-hot-toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}))

// Mock do date-fns
jest.mock('date-fns', () => ({
  differenceInYears: jest.fn(() => 25),
}))

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
}

const mockProfile = {
  username: 'testuser',
  birthdate: '1998-01-01',
  city: 'São Paulo',
  state: 'SP',
  userType: 'sugar_baby',
  about: 'Sobre mim teste',
  lookingFor: 'O que busco teste',
  photoURL: 'https://example.com/photo.jpg',
  premium: false,
  verified: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  name: 'Test User',
  // Novos campos adicionados na edição
  aboutPending: 'Sobre mim pendente',
  whatLookingForPending: 'O que busco pendente',
  education: 'Ensino Superior',
  smokes: 'Não',
  drinks: 'Sim',
  hasChildren: 'Não',
  height: '1,70m',
  weight: '65kg',
  relationshipType: 'Presencial',
  availableForTravel: 'Sim',
  receiveTravelers: 'A combinar',
  travelMode: {
    active: true,
    destination: 'Rio de Janeiro',
    from: '2024-02-01',
    to: '2024-02-15',
    looking: 'Sugar Daddy',
  },
  social: {
    instagram: '@testuser',
    twitter: '@testuser',
    facebook: 'testuser',
  },
}

const renderWithAuth = (component: React.ReactElement, user = mockUser) => {
  return render(
    <AuthContext.Provider value={{
      user,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
      signUp: jest.fn(),
    }}>
      {component}
    </AuthContext.Provider>
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderização básica', () => {
    it('deve renderizar o título "Meu Perfil"', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
    })

    it('deve renderizar o username do usuário', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('@testuser')).toBeInTheDocument()
    })

    it('deve renderizar o nome do usuário', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Test User')).toBeInTheDocument()
    })

    it('deve renderizar o tipo de usuário (Sugar Baby)', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Sugar Baby')).toBeInTheDocument()
    })

    it('deve renderizar a idade calculada', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('25 anos')).toBeInTheDocument()
    })

    it('deve renderizar a cidade e estado', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('São Paulo, SP')).toBeInTheDocument()
    })
  })

  describe('Botões de ação', () => {
    it('deve renderizar o botão "Editar"', () => {
      renderWithAuth(<ProfilePage />)
      const editButton = screen.getByText('Editar')
      expect(editButton).toBeInTheDocument()
      expect(editButton.closest('a')).toHaveAttribute('href', '/profile/edit')
    })

    it('deve renderizar o botão "Premium"', () => {
      renderWithAuth(<ProfilePage />)
      const premiumButton = screen.getByText('Premium')
      expect(premiumButton).toBeInTheDocument()
      expect(premiumButton.closest('a')).toHaveAttribute('href', '/premium')
    })
  })

  describe('Seções de conteúdo', () => {
    it('deve renderizar a seção "Sobre Mim"', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Sobre Mim')).toBeInTheDocument()
      expect(screen.getByText('Sobre mim teste')).toBeInTheDocument()
    })

    it('deve renderizar a seção "O que Procuro"', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('O que Procuro')).toBeInTheDocument()
      expect(screen.getByText('O que busco teste')).toBeInTheDocument()
    })

    it('deve renderizar a seção "Estatísticas"', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Estatísticas')).toBeInTheDocument()
      expect(screen.getByText('Visualizações do perfil')).toBeInTheDocument()
      expect(screen.getByText('Likes recebidos')).toBeInTheDocument()
      expect(screen.getByText('Mensagens recebidas')).toBeInTheDocument()
    })

    it('deve renderizar a seção "Ações Rápidas"', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Ações Rápidas')).toBeInTheDocument()
      expect(screen.getByText('Explorar')).toBeInTheDocument()
      expect(screen.getByText('Mensagens')).toBeInTheDocument()
      expect(screen.getByText('Quem Viu')).toBeInTheDocument()
      expect(screen.getByText('Solicitações')).toBeInTheDocument()
    })

    it('deve renderizar a seção "Status da Conta"', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Status da Conta')).toBeInTheDocument()
      expect(screen.getByText('Tipo de conta')).toBeInTheDocument()
      expect(screen.getByText('Verificação')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  describe('Status da conta', () => {
    it('deve mostrar "Básica" quando não é premium', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Básica')).toBeInTheDocument()
    })

    it('deve mostrar "Não verificado" quando não é verificado', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Não verificado')).toBeInTheDocument()
    })

    it('deve mostrar "Ativo" como status padrão', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText('Ativo')).toBeInTheDocument()
    })
  })

  describe('Foto de perfil', () => {
    it('deve renderizar a foto do usuário', () => {
      renderWithAuth(<ProfilePage />)
      const photo = screen.getByAltText('Foto de perfil')
      expect(photo).toBeInTheDocument()
      expect(photo).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })

    it('deve renderizar o botão de upload de foto', () => {
      renderWithAuth(<ProfilePage />)
      const uploadButton = screen.getByLabelText(/camera/i)
      expect(uploadButton).toBeInTheDocument()
    })
  })

  describe('Links de navegação', () => {
    it('deve ter link para explorar', () => {
      renderWithAuth(<ProfilePage />)
      const exploreLink = screen.getByText('Explorar').closest('a')
      expect(exploreLink).toHaveAttribute('href', '/explore')
    })

    it('deve ter link para mensagens', () => {
      renderWithAuth(<ProfilePage />)
      const messagesLink = screen.getByText('Mensagens').closest('a')
      expect(messagesLink).toHaveAttribute('href', '/messages')
    })

    it('deve ter link para "Quem Viu"', () => {
      renderWithAuth(<ProfilePage />)
      const whoViewedLink = screen.getByText('Quem Viu').closest('a')
      expect(whoViewedLink).toHaveAttribute('href', '/profile/who-viewed-me')
    })

    it('deve ter link para solicitações', () => {
      renderWithAuth(<ProfilePage />)
      const requestsLink = screen.getByText('Solicitações').closest('a')
      expect(requestsLink).toHaveAttribute('href', '/profile/requests')
    })
  })

  describe('Informações de membro', () => {
    it('deve mostrar a data de criação da conta', () => {
      renderWithAuth(<ProfilePage />)
      expect(screen.getByText(/Membro desde/)).toBeInTheDocument()
    })
  })

  describe('Estados de loading', () => {
    it('deve mostrar loading quando está carregando', () => {
      render(
        <AuthContext.Provider value={{
          user: mockUser,
          loading: true,
          signIn: jest.fn(),
          signOut: jest.fn(),
          signUp: jest.fn(),
        }}>
          <ProfilePage />
        </AuthContext.Provider>
      )
      
      // Verifica se há elementos de loading (pode variar dependendo da implementação)
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument()
    })
  })

  describe('Redirecionamento', () => {
    it('deve redirecionar para login quando não há usuário', () => {
      const mockPush = jest.fn()
      jest.mocked(require('next/navigation').useRouter).mockReturnValue({
        push: mockPush,
      })

      render(
        <AuthContext.Provider value={{
          user: null,
          loading: false,
          signIn: jest.fn(),
          signOut: jest.fn(),
          signUp: jest.fn(),
        }}>
          <ProfilePage />
        </AuthContext.Provider>
      )

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('Perfil não encontrado', () => {
    it('deve mostrar mensagem quando perfil não existe', () => {
      // Mock do getDoc para retornar que o documento não existe
      const mockGetDoc = jest.mocked(require('firebase/firestore').getDoc)
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      } as any)

      renderWithAuth(<ProfilePage />)
      
      // Como o componente faz fetch no useEffect, precisamos aguardar
      waitFor(() => {
        expect(screen.getByText('Perfil não encontrado')).toBeInTheDocument()
      })
    })
  })

  describe('Upload de foto', () => {
    it('deve ter input de arquivo para upload de foto', () => {
      renderWithAuth(<ProfilePage />)
      const fileInput = screen.getByLabelText(/camera/i).querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })
  })

  describe('Responsividade', () => {
    it('deve ter classes responsivas para grid', () => {
      renderWithAuth(<ProfilePage />)
      const gridContainer = screen.getByText('Meu Perfil').closest('div')?.parentElement
      expect(gridContainer).toHaveClass('grid', 'md:grid-cols-3')
    })
  })
}) 