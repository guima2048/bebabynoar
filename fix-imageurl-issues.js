const fs = require('fs');
const path = require('path');

// Função para corrigir arquivos que usam imageURL incorretamente
function fixImageURLIssues() {
  console.log('🔧 Corrigindo problemas de imageURL...');
  
  // Lista de arquivos que podem ter problemas
  const filesToCheck = [
    'app/blog/[slug]/page.tsx',
    'app/api/blog/route.ts', // Este arquivo não deveria existir
    'lib/mock-data.ts'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      console.log(`📁 Verificando: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Corrigir problemas específicos
      if (filePath === 'app/blog/[slug]/page.tsx') {
        // Remover referências a imageURL em posts do blog
        const originalContent = content;
        content = content.replace(/imageURL\?: string/g, 'featuredImage?: string');
        content = content.replace(/post\.imageURL/g, 'post.featuredImage');
        content = content.replace(/relatedPost\.imageURL/g, 'relatedPost.featuredImage');
        
        if (content !== originalContent) {
          modified = true;
          console.log(`✅ Corrigido: ${filePath}`);
        }
      }
      
      if (filePath === 'app/api/blog/route.ts') {
        console.log(`❌ Arquivo problemático encontrado: ${filePath}`);
        console.log('🗑️ Removendo arquivo...');
        fs.unlinkSync(filePath);
        console.log(`✅ Arquivo removido: ${filePath}`);
        return;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  });
  
  console.log('✅ Correções aplicadas!');
}

// Executar correções
fixImageURLIssues(); 