const fs = require('fs');
const path = require('path');

// Arquivos que ainda têm problemas
const filesToFix = [
  'app/profile/page.tsx'
];

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Corrigir uso de db
    content = content.replace(
      /(\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*?)(\w+\.\w+\(db,)/g,
      '$1const db = getFirestoreDB();\n    if (!db) {\n      console.error(\'Erro de configuração do banco de dados\');\n      return;\n    }\n    $2'
    );
    
    // Corrigir uso de storage
    content = content.replace(
      /(\w+\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[^}]*?)(\w+\.\w+\(storage,)/g,
      '$1const storage = getFirebaseStorage();\n    if (!storage) {\n      throw new Error(\'Erro de configuração do storage\');\n    }\n    $2'
    );
    
    // Corrigir uso de db em funções não-async
    content = content.replace(
      /(\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*?)(\w+\.\w+\(db,)/g,
      '$1const db = getFirestoreDB();\n    if (!db) {\n      console.error(\'Erro de configuração do banco de dados\');\n      return;\n    }\n    $2'
    );
    
    // Corrigir uso de storage em funções não-async
    content = content.replace(
      /(\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*?)(\w+\.\w+\(storage,)/g,
      '$1const storage = getFirebaseStorage();\n    if (!storage) {\n      throw new Error(\'Erro de configuração do storage\');\n    }\n    $2'
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Corrigido: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
  }
});

console.log('🎉 Correção final concluída!'); 