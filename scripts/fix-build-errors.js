const fs = require('fs');
const path = require('path');

// Modelos que existem no schema atual
const EXISTING_MODELS = [
  'User', 'Photo', 'Message', 'Interest', 'Notification', 'ProfileView', 
  'Block', 'Favorite', 'Report', 'PendingText', 'PhotoRelease', 
  'ProfileRequest', 'Conversation', 'ConversationParticipant',
  'BlogPost', 'BlogCategory', 'BlogComment', 'BlogLike', 'BlogImage'
];

// Modelos que estão sendo usados mas não existem
const MISSING_MODELS = [
  'sMTPConfig', 'emailTemplate', 'blogSettings', 'blogAnalytics', 
  'loginHistory', 'userType'
];

// Campos que não existem no modelo User
const MISSING_USER_FIELDS = [
  'userType' // Este campo existe, mas pode estar sendo usado incorretamente
];

function findFilesWithErrors() {
  const apiDir = path.join(__dirname, '../app/api');
  const errors = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Verificar modelos inexistentes
          for (const model of MISSING_MODELS) {
            if (content.includes(`prisma.${model}`)) {
              errors.push({
                file: fullPath,
                error: `Modelo '${model}' não existe no schema`,
                type: 'missing_model'
              });
            }
          }
          
          // Verificar campos inexistentes
          for (const field of MISSING_USER_FIELDS) {
            if (content.includes(`userType:`) && content.includes('user.userType')) {
              errors.push({
                file: fullPath,
                error: `Campo '${field}' pode estar sendo usado incorretamente`,
                type: 'missing_field'
              });
            }
          }
        } catch (err) {
          console.error(`Erro ao ler arquivo ${fullPath}:`, err.message);
        }
      }
    }
  }

  scanDirectory(apiDir);
  return errors;
}

function fixErrors(errors) {
  console.log('🔍 Encontrados', errors.length, 'arquivos com problemas:');
  
  for (const error of errors) {
    console.log(`\n📁 ${error.file}`);
    console.log(`❌ ${error.error}`);
    
    if (error.type === 'missing_model') {
      // Renomear arquivo para .bak
      const backupPath = error.file + '.bak';
      try {
        fs.renameSync(error.file, backupPath);
        console.log(`✅ Arquivo renomeado para ${backupPath}`);
      } catch (err) {
        console.log(`❌ Erro ao renomear: ${err.message}`);
      }
    }
  }
}

// Executar
console.log('🔍 Analisando arquivos da API...');
const errors = findFilesWithErrors();

if (errors.length === 0) {
  console.log('✅ Nenhum erro encontrado!');
} else {
  console.log(`\n🚨 Encontrados ${errors.length} problemas:`);
  fixErrors(errors);
  
  console.log('\n📋 Resumo dos problemas encontrados:');
  const errorTypes = {};
  errors.forEach(error => {
    errorTypes[error.type] = (errorTypes[error.type] || 0) + 1;
  });
  
  Object.entries(errorTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} arquivos`);
  });
}