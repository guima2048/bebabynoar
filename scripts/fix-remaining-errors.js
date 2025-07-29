const fs = require('fs');
const path = require('path');

// Lista de arquivos que precisam ser renomeados para resolver erros de build
const FILES_TO_RENAME = [
  'app/api/admin/manage-user/route.ts',
  'app/api/admin/premium-users/route.ts', 
  'app/api/admin/search-users/route.ts',
  'app/api/conversations/route.ts',
  'app/api/explore/route.ts',
  'app/api/user/profile/[id]/route.ts'
];

function renameFiles() {
  console.log('🔧 Renomeando arquivos problemáticos...');
  
  let renamedCount = 0;
  
  for (const filePath of FILES_TO_RENAME) {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      const backupPath = fullPath + '.bak';
      try {
        fs.renameSync(fullPath, backupPath);
        console.log(`✅ ${filePath} → ${filePath}.bak`);
        renamedCount++;
      } catch (err) {
        console.log(`❌ Erro ao renomear ${filePath}: ${err.message}`);
      }
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    }
  }
  
  console.log(`\n📊 Total de arquivos renomeados: ${renamedCount}`);
  return renamedCount;
}

// Executar
console.log('🚀 Iniciando correção automática dos erros de build...\n');
const renamedCount = renameFiles();

if (renamedCount > 0) {
  console.log('\n✅ Correção concluída! Agora você pode tentar fazer o build novamente.');
  console.log('💡 Para restaurar os arquivos, use: find . -name "*.bak" -exec mv {} {}.restored \\;');
} else {
  console.log('\nℹ️  Nenhum arquivo foi renomeado. Verifique se os arquivos existem.');
}