#!/bin/bash

# Corrige permissões da pasta de uploads do blog
UPLOAD_DIR="public/uploads/blog"

if [ ! -d "$UPLOAD_DIR" ]; then
  echo "Diretório $UPLOAD_DIR não existe."
  exit 1
fi

echo "Corrigindo permissões da pasta $UPLOAD_DIR..."
chmod -R 755 "$UPLOAD_DIR"
find "$UPLOAD_DIR" -type f -exec chmod 644 {} \;
echo "Permissões corrigidas com sucesso!" 