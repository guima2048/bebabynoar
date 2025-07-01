const fs = require('fs');

// Arquivos específicos que ainda precisam ser corrigidos
const filesToFix = [
  'app/api/process-payment/route.ts',
  'app/api/events/route.ts',
  'app/api/blog/[id]/route.ts',
  'app/api/block/route.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Substituir verificações de db restantes
    const dbCheckPattern = /if\s*\(\s*!db\s*\)\s*{\s*return\s+NextResponse\.json\(\s*{\s*error:\s*['"]Erro de configuração do banco de dados['"]\s*}\s*,\s*{\s*status:\s*500\s*}\s*\);\s*}/g;
    if (dbCheckPattern.test(content)) {
      content = content.replace(dbCheckPattern, 'const db = getFirestoreDB()');
      changed = true;
    }
    
    // Substituir verificações de db com console.error
    const dbErrorPattern = /if\s*\(\s*!db\s*\)\s*{\s*console\.error\([^)]+\);\s*return;\s*}/g;
    if (dbErrorPattern.test(content)) {
      content = content.replace(dbErrorPattern, 'const db = getFirestoreDB()');
      changed = true;
    }
    
    // Substituir verificações de db com return null
    const dbNullPattern = /if\s*\(\s*!db\s*\)\s*{\s*return\s+null;\s*}/g;
    if (dbNullPattern.test(content)) {
      content = content.replace(dbNullPattern, 'const db = getFirestoreDB()');
      changed = true;
    }
    
    // Substituir verificações de db com return event
    const dbEventPattern = /if\s*\(\s*!db\s*\)\s*{\s*return\s+event;\s*}/g;
    if (dbEventPattern.test(content)) {
      content = content.replace(dbEventPattern, 'const db = getFirestoreDB()');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Corrigindo arquivos restantes...\n');
  
  let fixedCount = 0;
  
  filesToFix.forEach(file => {
    if (fs.existsSync(file)) {
      if (fixFile(file)) {
        fixedCount++;
      }
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${file}`);
    }
  });
  
  console.log(`\n📊 Arquivos corrigidos: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Correções concluídas!');
  } else {
    console.log('\n✨ Nenhum arquivo precisou ser corrigido!');
  }
}

main(); 