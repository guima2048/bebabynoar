const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser corrigidos
const filesToFix = [
  'app/api/verify-email/route.ts',
  'app/api/start-conversation/route.ts',
  'app/api/send-message-notification/route.ts',
  'app/api/send-interest/route.ts',
  'app/api/reviews/route.ts',
  'app/api/reset-password/route.ts',
  'app/api/request-private-photos/route.ts',
  'app/api/reports/route.ts',
  'app/api/report-user/route.ts',
  'app/api/record-profile-view/route.ts',
  'app/api/push-notification/route.ts',
  'app/api/process-payment/route.ts',
  'app/api/notify-trip/route.ts',
  'app/api/moderate-content/route.ts',
  'app/api/favorites/route.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Padrão para encontrar funções que usam getFirestoreDB()
    const functionPattern = /export async function (GET|POST|PUT|DELETE|PATCH)\([^)]*\)\s*\{[\s\S]*?const db = getFirestoreDB\(\)[\s\S]*?\}/g;
    
    content = content.replace(functionPattern, (match) => {
      // Verificar se já tem a verificação de null
      if (match.includes('if (!db) {')) {
        return match; // Já está corrigido
      }

      // Adicionar verificação de null após a declaração do db
      const newMatch = match.replace(
        /const db = getFirestoreDB\(\)/,
        `const db = getFirestoreDB()
    if (!db) {
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados' }, { status: 500 })
    }`
      );
      
      modified = true;
      return newMatch;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
    } else {
      console.log(`⏭️  Já corrigido: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
  }
}

console.log('🔧 Iniciando correções automáticas...\n');

filesToFix.forEach(fixFile);

console.log('\n🎉 Correções concluídas!');
console.log('💡 Execute: git add . && git commit -m "fix: add null checks for Firestore in all API routes"'); 