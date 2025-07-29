const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando correção de todos os problemas relacionados aos campos removidos...');

// 1. Corrigir types/next-auth.d.ts
console.log('📝 Corrigindo types/next-auth.d.ts...');
const nextAuthTypes = `import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      image?: string
      userType: string
      premium: boolean
      emailVerified: boolean
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    username: string
    image?: string
    userType: string
    premium: boolean
    emailVerified: boolean
    isAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userType: string
    premium: boolean
    emailVerified: boolean
    isAdmin: boolean
  }
}`;

fs.writeFileSync('types/next-auth.d.ts', nextAuthTypes);
console.log('✅ types/next-auth.d.ts corrigido');

// 2. Corrigir lib/auth.ts
console.log('📝 Corrigindo lib/auth.ts...');
const authContent = fs.readFileSync('lib/auth.ts', 'utf8');
const authFixed = authContent
  .replace(/user\.verified/g, 'user.emailVerified')
  .replace(/verified: user\.verified/g, 'emailVerified: user.emailVerified')
  .replace(/token\.verified/g, 'token.emailVerified')
  .replace(/session\.user\.verified/g, 'session.user.emailVerified');

fs.writeFileSync('lib/auth.ts', authFixed);
console.log('✅ lib/auth.ts corrigido');

// 3. Corrigir lib/validation.ts
console.log('📝 Corrigindo lib/validation.ts...');
const validationContent = fs.readFileSync('lib/validation.ts', 'utf8');
const validationFixed = validationContent
  .replace(/height: z\.string\(\)\.max\(10\)\.optional\(\),/g, '')
  .replace(/weight: z\.string\(\)\.max\(10\)\.optional\(\),/g, '')
  .replace(/relationshipType: z\.string\(\)\.max\(100\)\.optional\(\),/g, '')
  .replace(/availableForTravel: z\.boolean\(\)\.optional\(\),/g, '')
  .replace(/hasChildren: z\.boolean\(\)\.optional\(\),/g, '')
  .replace(/smokes: z\.boolean\(\)\.optional\(\),/g, '')
  .replace(/drinks: z\.boolean\(\)\.optional\(\),/g, '');

fs.writeFileSync('lib/validation.ts', validationFixed);
console.log('✅ lib/validation.ts corrigido');

// 4. Corrigir lib/schemas.ts
console.log('📝 Corrigindo lib/schemas.ts...');
const schemasContent = fs.readFileSync('lib/schemas.ts', 'utf8');
const schemasFixed = schemasContent
  .replace(/location: z\.string\(\)\.min\(1, 'Localização é obrigatória'\)\.max\(100, 'Localização muito longa'\),/g, '')
  .replace(/location: z\.string\(\)\.min\(1, 'Localização é obrigatória'\)\.max\(100, 'Localização muito longa'\)\.optional\(\),/g, '')
  .replace(/location: z\.string\(\)\.min\(1, 'Localização é obrigatória'\)\.max\(200, 'Localização muito longa'\),/g, '');

fs.writeFileSync('lib/schemas.ts', schemasFixed);
console.log('✅ lib/schemas.ts corrigido');

// 5. Corrigir app/profile/[id]/page.tsx
console.log('📝 Corrigindo app/profile/[id]/page.tsx...');
const profileIdContent = fs.readFileSync('app/profile/[id]/page.tsx', 'utf8');
const profileIdFixed = profileIdContent
  .replace(/location\?: string/g, '')
  .replace(/relationshipType\?: string/g, '')
  .replace(/height\?: string/g, '')
  .replace(/weight\?: string/g, '')
  .replace(/hasChildren\?: boolean/g, '')
  .replace(/smokes\?: boolean/g, '')
  .replace(/drinks\?: boolean/g, '')
  .replace(/availableForTravel\?: string/g, '')
  .replace(/relationshipType: profile\.relationshipType,/g, '')
  .replace(/height: profile\.height,/g, '')
  .replace(/weight: profile\.weight,/g, '')
  .replace(/hasChildren: profile\.hasChildren,/g, '')
  .replace(/smokes: profile\.smokes,/g, '')
  .replace(/drinks: profile\.drinks,/g, '')
  .replace(/availableForTravel: profile\.availableForTravel,/g, '');

fs.writeFileSync('app/profile/[id]/page.tsx', profileIdFixed);
console.log('✅ app/profile/[id]/page.tsx corrigido');

// 6. Corrigir contexts/AuthContext.tsx
console.log('📝 Corrigindo contexts/AuthContext.tsx...');
const authContextContent = fs.readFileSync('contexts/AuthContext.tsx', 'utf8');
const authContextFixed = authContextContent
  .replace(/location\?: string/g, '');

fs.writeFileSync('contexts/AuthContext.tsx', authContextFixed);
console.log('✅ contexts/AuthContext.tsx corrigido');

// 7. Remover arquivos de teste desnecessários
console.log('🗑️ Removendo arquivos de teste desnecessários...');
const filesToRemove = [
  'test-user-login.js',
  'test-session-debug.js',
  'test-login.js',
  'fill-user-profile.js'
];

filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`✅ ${file} removido`);
  }
});

// 8. Corrigir lib/mock-data.ts
console.log('📝 Corrigindo lib/mock-data.ts...');
const mockDataContent = fs.readFileSync('lib/mock-data.ts', 'utf8');
const mockDataFixed = mockDataContent
  .replace(/isVerified\?: boolean/g, 'emailVerified?: boolean')
  .replace(/isVerified: true,/g, 'emailVerified: true,')
  .replace(/isVerified: false,/g, 'emailVerified: false,')
  .replace(/verified: boolean/g, 'emailVerified: boolean')
  .replace(/verified: true,/g, 'emailVerified: true,')
  .replace(/verified: false,/g, 'emailVerified: false,');

fs.writeFileSync('lib/mock-data.ts', mockDataFixed);
console.log('✅ lib/mock-data.ts corrigido');

// 9. Corrigir lib/auth-simple.ts
console.log('📝 Corrigindo lib/auth-simple.ts...');
const authSimpleContent = fs.readFileSync('lib/auth-simple.ts', 'utf8');
const authSimpleFixed = authSimpleContent
  .replace(/verified: user\.verified/g, 'emailVerified: user.emailVerified');

fs.writeFileSync('lib/auth-simple.ts', authSimpleFixed);
console.log('✅ lib/auth-simple.ts corrigido');

console.log('\n🎉 TODOS OS PROBLEMAS FORAM CORRIGIDOS!');
console.log('\n📋 RESUMO DAS CORREÇÕES:');
console.log('✅ types/next-auth.d.ts - verified → emailVerified');
console.log('✅ lib/auth.ts - verified → emailVerified');
console.log('✅ lib/validation.ts - campos removidos');
console.log('✅ lib/schemas.ts - location removido');
console.log('✅ app/profile/[id]/page.tsx - campos removidos');
console.log('✅ contexts/AuthContext.tsx - location removido');
console.log('✅ lib/mock-data.ts - verified → emailVerified');
console.log('✅ lib/auth-simple.ts - verified → emailVerified');
console.log('✅ Arquivos de teste removidos');

console.log('\n🚀 Agora você pode executar:');
console.log('npm run dev');
console.log('\nE testar se tudo está funcionando corretamente!'); 