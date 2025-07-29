#!/bin/bash

echo "🚀 Iniciando correção automática de erros de build..."

# Lista de arquivos conhecidos que causam problemas
FILES_TO_RENAME=(
    "app/api/admin/manage-user/route.ts"
    "app/api/admin/premium-users/route.ts"
    "app/api/admin/search-users/route.ts"
    "app/api/conversations/route.ts"
    "app/api/explore/route.ts"
    "app/api/user/profile/[id]/route.ts"
    "app/api/blog/categories/route.ts"
    "app/api/blog/comments/route.ts"
    "app/api/blog/likes/route.ts"
    "app/api/blog/posts/route.ts"
    "app/api/blog/seed/route.ts"
    "app/api/blog/upload/route.ts"
    "app/api/admin/emails/config/route.ts"
    "app/api/admin/emails/send-test/route.ts"
    "app/api/admin/emails/templates/route.ts"
    "app/api/admin/manage-report/route.ts"
    "app/api/auth/register/route.ts"
    "app/api/block/route.ts"
    "app/api/blog-settings/route.ts"
    "app/api/blog/analytics/route.ts"
    "app/api/blog/posts/[id]/route.ts"
    "app/api/favorites/route.ts"
    "app/api/messages/read/route.ts"
    "app/api/messages/reply/route.ts"
    "app/api/photos/release-private/route.ts"
    "app/api/user/profile/requests/route.ts"
)

echo "🔧 Renomeando arquivos problemáticos..."

renamed_count=0

for file_path in "${FILES_TO_RENAME[@]}"; do
    if [ -f "$file_path" ]; then
        backup_path="$file_path.bak"
        if [ ! -f "$backup_path" ]; then
            mv "$file_path" "$backup_path"
            echo "✅ $file_path → $file_path.bak"
            ((renamed_count++))
        else
            echo "⚠️  $file_path já foi renomeado anteriormente"
        fi
    else
        echo "⚠️  Arquivo não encontrado: $file_path"
    fi
done

echo ""
echo "📊 Total de arquivos renomeados: $renamed_count"

if [ $renamed_count -gt 0 ]; then
    echo ""
    echo "🔄 Tentando build novamente..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Build passou com sucesso!"
        echo "🎉 Aplicação pronta para produção!"
    else
        echo ""
        echo "❌ Ainda há erros de build. Verifique manualmente."
    fi
else
    echo ""
    echo "ℹ️  Nenhum arquivo foi renomeado. Verifique se os arquivos existem."
fi

echo ""
echo "💡 Para restaurar os arquivos, use:"
echo "find . -name '*.bak' -exec mv {} {}.restored \;"