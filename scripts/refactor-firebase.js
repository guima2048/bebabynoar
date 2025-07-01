const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Padrões para encontrar e substituir
const patterns = [
  // Import statements
  {
    from: /import\s*{\s*db\s*}\s*from\s*['"]@\/lib\/firebase['"]/g,
    to: "import { getFirestoreDB } from '@/lib/firebase'"
  },
  {
    from: /import\s*{\s*storage\s*}\s*from\s*['"]@\/lib\/firebase['"]/g,
    to: "import { getFirebaseStorage } from '@/lib/firebase'"
  },
  {
    from: /import\s*{\s*db,\s*storage\s*}\s*from\s*['"]@\/lib\/firebase['"]/g,
    to: "import { getFirestoreDB, getFirebaseStorage } from '@/lib/firebase'"
  },
  {
    from: /import\s*{\s*storage,\s*db\s*}\s*from\s*['"]@\/lib\/firebase['"]/g,
    to: "import { getFirebaseStorage, getFirestoreDB } from '@/lib/firebase'"
  },
  
  // Verificações de db
  {
    from: /if\s*\(\s*!db\s*\)\s*{\s*return\s+NextResponse\.json\(\s*{\s*error:\s*['"]Erro de configuração do banco de dados['"]\s*}\s*,\s*{\s*status:\s*500\s*}\s*\);\s*}/g,
    to: "const db = getFirestoreDB()"
  },
  {
    from: /if\s*\(\s*!db\s*\)\s*{\s*console\.error\([^)]+\);\s*return;\s*}/g,
    to: "const db = getFirestoreDB()"
  },
  {
    from: /if\s*\(\s*!db\s*\)\s*{\s*return\s+null;\s*}/g,
    to: "const db = getFirestoreDB()"
  },
  
  // Verificações de storage
  {
    from: /if\s*\(\s*!storage\s*\)\s*{\s*return\s+NextResponse\.json\(\s*{\s*error:\s*['"]Erro de configuração do storage['"]\s*}\s*,\s*{\s*status:\s*500\s*}\s*\);\s*}/g,
    to: "const storage = getFirebaseStorage()"
  },
  
  // Verificações combinadas
  {
    from: /if\s*\(\s*!db\s*\)\s*{\s*[^}]*}\s*if\s*\(\s*!storage\s*\)\s*{\s*[^}]*}/g,
    to: "const db = getFirestoreDB()\n    const storage = getFirebaseStorage()"
  }
];

// Função para refatorar um arquivo
function refactorFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changed = false;
    
    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Refatorado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao refatorar ${filePath}:`, error.message);
    return false;
  }
}

// Função principal
function main() {
  console.log('🔄 Iniciando refatoração dos arquivos Firebase...\n');
  
  // Encontrar todos os arquivos TypeScript na pasta app
  const files = glob.sync('app/**/*.ts', { ignore: ['**/node_modules/**'] });
  
  let refactoredCount = 0;
  let totalFiles = files.length;
  
  files.forEach(file => {
    if (refactorFile(file)) {
      refactoredCount++;
    }
  });
  
  console.log(`\n📊 Resumo:`);
  console.log(`   Total de arquivos processados: ${totalFiles}`);
  console.log(`   Arquivos refatorados: ${refactoredCount}`);
  console.log(`   Arquivos inalterados: ${totalFiles - refactoredCount}`);
  
  if (refactoredCount > 0) {
    console.log('\n🎉 Refatoração concluída! Execute "git add . && git commit" para salvar as mudanças.');
  } else {
    console.log('\n✨ Nenhum arquivo precisou ser refatorado!');
  }
}

// Executar o script
if (require.main === module) {
  main();
}

module.exports = { refactorFile, patterns }; 