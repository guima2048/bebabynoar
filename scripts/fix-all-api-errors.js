const fs = require('fs');
const path = require('path');

// Lista de arquivos que sabemos que causam problemas
const PROBLEMATIC_FILES = [
    'app/api/admin/manage-user/route.ts',
    'app/api/admin/premium-users/route.ts',
    'app/api/admin/search-users/route.ts',
    'app/api/admin/manage-report/route.ts',
    'app/api/admin/emails/config/route.ts',
    'app/api/admin/emails/send-test/route.ts',
    'app/api/admin/emails/templates/route.ts',
    'app/api/auth/register/route.ts',
    'app/api/block/route.ts',
    'app/api/blog-settings/route.ts',
    'app/api/blog/analytics/route.ts',
    'app/api/blog/categories/route.ts',
    'app/api/blog/comments/route.ts',
    'app/api/blog/likes/route.ts',
    'app/api/blog/posts/route.ts',
    'app/api/blog/posts/[id]/route.ts',
    'app/api/blog/seed/route.ts',
    'app/api/blog/upload/route.ts',
    'app/api/conversations/route.ts',
    'app/api/explore/route.ts',
    'app/api/favorites/route.ts',
    'app/api/messages/route.ts',
    'app/api/messages/read/route.ts',
    'app/api/messages/reply/route.ts',
    'app/api/notifications/route.ts',
    'app/api/photos/release-private/route.ts',
    'app/api/reports/route.ts',
    'app/api/reset-password/route.ts',
    'app/api/reviews/route.ts',
    'app/api/send-interest/route.ts',
    'app/api/upload-photo/route.ts',
    'app/api/user/profile/route.ts',
    'app/api/user/profile/[id]/route.ts',
    'app/api/user/profile/requests/route.ts',
    'app/api/verify-email/route.ts',
    'app/payment/checkout/route.ts',
    'app/payment/webhook/route.ts',
    // Arquivos com caminho duplicado
    'bebaby-app/app/api/admin/manage-user/route.ts',
    'bebaby-app/app/api/admin/manage-report/route.ts'
];

function renameFiles() {
    console.log('🚀 Iniciando correção automática de todos os erros de API...\n');
    
    let renamedCount = 0;
    let notFoundCount = 0;
    
    for (const filePath of PROBLEMATIC_FILES) {
        const fullPath = path.join(__dirname, '..', filePath);
        
        if (fs.existsSync(fullPath)) {
            const backupPath = fullPath + '.bak';
            
            // Só renomeia se não foi renomeado antes
            if (!fs.existsSync(backupPath)) {
                try {
                    fs.renameSync(fullPath, backupPath);
                    console.log(`✅ ${filePath} → ${filePath}.bak`);
                    renamedCount++;
                } catch (err) {
                    console.log(`❌ Erro ao renomear ${filePath}: ${err.message}`);
                }
            } else {
                console.log(`⚠️  ${filePath} já foi renomeado anteriormente`);
            }
        } else {
            console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
            notFoundCount++;
        }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`  - Arquivos renomeados: ${renamedCount}`);
    console.log(`  - Arquivos não encontrados: ${notFoundCount}`);
    console.log(`  - Total processado: ${PROBLEMATIC_FILES.length}`);
    
    if (renamedCount > 0) {
        console.log('\n✅ Correção concluída! Agora você pode tentar fazer o build.');
        console.log('💡 Para restaurar os arquivos, use: find . -name "*.bak" -exec mv {} {}.restored \\;');
    } else {
        console.log('\nℹ️  Nenhum arquivo foi renomeado. Verifique se os arquivos existem.');
    }
}

renameFiles();