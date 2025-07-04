// Tipos de usuário
export type UserType = 'sugar_baby' | 'sugar_daddy' | 'sugar_mommy' | 'sugar_babyboy'
export type Gender = 'male' | 'female'
export type LookingFor = 'male' | 'female' | 'both'

// Interface para usuário
export interface User {
  id: string
  userType: UserType
  gender: Gender
  lookingFor: LookingFor
  username: string
  photoURL?: string
  [key: string]: any
}

// Grupos de usuários
export const GROUP_1 = ['sugar_baby', 'sugar_babyboy'] // Quem busca benefícios
export const GROUP_2 = ['sugar_daddy', 'sugar_mommy']  // Quem oferece benefícios

// Mapeamento de tipos para gênero
export const USER_TYPE_GENDER_MAP: Record<UserType, Gender> = {
  'sugar_baby': 'female',    // Mulher que busca benefícios
  'sugar_daddy': 'male',     // Homem que oferece benefícios
  'sugar_mommy': 'female',   // Mulher que oferece benefícios
  'sugar_babyboy': 'male'    // Homem que busca benefícios
}

// Função para determinar se dois usuários podem se ver
export function canUsersSeeEachOther(user1: User, user2: User): boolean {
  // Usuários não podem se ver a si mesmos
  if (user1.id === user2.id) return false

  const user1Gender = user1.gender || USER_TYPE_GENDER_MAP[user1.userType]
  const user2Gender = user2.gender || USER_TYPE_GENDER_MAP[user2.userType]

  // Regra 1: Mesmo grupo não pode se ver
  const user1Group = GROUP_1.includes(user1.userType) ? 1 : 2
  const user2Group = GROUP_1.includes(user2.userType) ? 1 : 2
  
  if (user1Group === user2Group) return false

  // Regra 2: Grupos diferentes podem se ver se as preferências combinam
  const user1WantsUser2 = user1.lookingFor === 'both' || user1.lookingFor === user2Gender
  const user2WantsUser1 = user2.lookingFor === 'both' || user2.lookingFor === user1Gender

  return user1WantsUser2 && user2WantsUser1
}

// Função para filtrar usuários que um usuário específico pode ver
export function filterVisibleUsers(currentUser: User, allUsers: User[]): User[] {
  return allUsers.filter(user => canUsersSeeEachOther(currentUser, user))
}

// Função para obter o nome amigável do tipo de usuário
export function getUserTypeDisplayName(userType: UserType): string {
  const names = {
    'sugar_baby': 'Sugar Baby',
    'sugar_daddy': 'Sugar Daddy',
    'sugar_mommy': 'Sugar Mommy',
    'sugar_babyboy': 'Sugar Babyboy'
  }
  return names[userType]
}

// Função para obter a cor do tipo de usuário
export function getUserTypeColor(userType: UserType): string {
  const colors = {
    'sugar_baby': 'from-pink-500 to-purple-500',
    'sugar_daddy': 'from-blue-500 to-indigo-500',
    'sugar_mommy': 'from-purple-500 to-pink-500',
    'sugar_babyboy': 'from-green-500 to-teal-500'
  }
  return colors[userType]
}

// Função para obter a abreviação do tipo de usuário
export function getUserTypeAbbreviation(userType: UserType): string {
  const abbreviations = {
    'sugar_baby': 'SB',
    'sugar_daddy': 'SD',
    'sugar_mommy': 'SM',
    'sugar_babyboy': 'SBB'
  }
  return abbreviations[userType]
} 