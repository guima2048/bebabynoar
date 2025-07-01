const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/profile/[id]/page.tsx',
  'app/profile/who-viewed-me/page.tsx',
  'app/profile/requests/page.tsx',
  'app/profile/page.tsx',
  'app/profile/edit/page.tsx',
  'app/explore/page.tsx'
];

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Substituir import de db por getFirestoreDB
    content = content.replace(
      /import\s*{\s*([^}]*db[^}]*)\s*}\s*from\s*['"]@\/lib\/firebase['"]/g,
      (match, imports) => {
        const newImports = imports
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => imp !== 'db')
          .join(', ');
        return `import { ${newImports}${newImports ? ', ' : ''}getFirestoreDB } from '@/lib/firebase'`;
      }
    );
    
    // Substituir import de storage por getFirebaseStorage
    content = content.replace(
      /import\s*{\s*([^}]*storage[^}]*)\s*}\s*from\s*['"]@\/lib\/firebase['"]/g,
      (match, imports) => {
        const newImports = imports
          .split(',')
          .map(imp => imp.trim())
          .filter(imp => imp !== 'storage')
          .join(', ');
        return `import { ${newImports}${newImports ? ', ' : ''}getFirebaseStorage } from '@/lib/firebase'`;
      }
    );
    
    // Adicionar const db = getFirestoreDB() no início das funções que usam db
    content = content.replace(
      /(\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*?)(\w+\.\w+\(db,)/g,
      '$1const db = getFirestoreDB();\n    if (!db) {\n      console.error(\'Erro de configuração do banco de dados\');\n      return;\n    }\n    $2'
    );
    
    // Adicionar const storage = getFirebaseStorage() no início das funções que usam storage
    content = content.replace(
      /(\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*?)(\w+\.\w+\(storage,)/g,
      '$1const storage = getFirebaseStorage();\n    if (!storage) {\n      console.error(\'Erro de configuração do storage\');\n      return;\n    }\n    $2'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
  }
});

console.log('🎉 Correção concluída!'); 